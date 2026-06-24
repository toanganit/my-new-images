// menu.js - Tự động tạo menu từ các thư mục có config.json
(async function buildMenu() {
    const REPO_OWNER = 'toanganit';    // ← ĐỔI NẾU CẦN
    const REPO_NAME = 'my-new-images';  // ← ĐỔI NẾU CẦN
    const TOKEN = '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
';    // ← DÁN TOKEN VÀO ĐÂY

    const ROOT_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/`;

    try {
        const res = await fetch(ROOT_API, {
            headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {}
        });
        if (!res.ok) throw new Error('Cannot fetch repo contents');
        const items = await res.json();
        const folders = items.filter(item => item.type === 'dir' && !item.name.startsWith('.'));

        const tabs = [];
        for (const folder of folders) {
            try {
                const configUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${folder.name}/config.json`;
                const configRes = await fetch(configUrl, {
                    headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {}
                });
                if (configRes.ok) {
                    const config = await configRes.json();
                    tabs.push({ name: folder.name, title: config.tabTitle || folder.name });
                } else {
                    tabs.push({ name: folder.name, title: folder.name });
                }
            } catch (e) {
                tabs.push({ name: folder.name, title: folder.name });
            }
        }

        const currentTab = window.CURRENT_TAB || '';
        const menuContainer = document.getElementById('dynamic-menu');
        if (!menuContainer) return;

        let menuHTML = '';
        tabs.forEach(tab => {
            const isActive = (tab.name === currentTab) ? ' class="active"' : '';
            const link = (currentTab === '') ? `./${tab.name}/` : `../${tab.name}/`;
            menuHTML += `<li><a href="${link}"${isActive}>${tab.title}</a></li>`;
        });
        menuContainer.innerHTML = menuHTML;
    } catch (error) {
        console.error('Lỗi tạo menu:', error);
    }
})();
