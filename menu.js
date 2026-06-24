// menu.js - Tự động tạo menu từ các thư mục có config.json
(async function buildMenu() {
    const REPO_OWNER = 'toanganit';   // ← SỬA
    const REPO_NAME = 'my-new-images';   // ← SỬA
    const ROOT_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/`;

    // Lấy danh sách thư mục
    try {
        const res = await fetch(ROOT_API);
        if (!res.ok) throw new Error('Cannot fetch repo contents');
        const items = await res.json();
        const folders = items.filter(item => item.type === 'dir' && !item.name.startsWith('.'));

        // Lấy tiêu đề từ config.json của từng thư mục (nếu có)
        const tabs = [];
        for (const folder of folders) {
            try {
                const configUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${folder.name}/config.json`;
                const configRes = await fetch(configUrl);
                if (configRes.ok) {
                    const config = await configRes.json();
                    tabs.push({ name: folder.name, title: config.tabTitle || folder.name });
                } else {
                    // Nếu không có config.json, vẫn thêm tab với tên thư mục
                    tabs.push({ name: folder.name, title: folder.name });
                }
            } catch (e) {
                tabs.push({ name: folder.name, title: folder.name });
            }
        }

        // Xác định tab hiện tại (nếu có biến CURRENT_TAB được định nghĩa trong trang)
        const currentTab = window.CURRENT_TAB || '';

        // Tạo menu HTML
        const menuContainer = document.getElementById('dynamic-menu');
        if (!menuContainer) return; // Không tìm thấy container

        let menuHTML = '';
        tabs.forEach(tab => {
            const isActive = (tab.name === currentTab) ? ' class="active"' : '';
            // Đường dẫn về thư mục cha rồi vào tab (phù hợp với cả trang chủ và trang con)
            const link = (currentTab === '') ? `./${tab.name}/` : `../${tab.name}/`;
            menuHTML += `<li><a href="${link}"${isActive}>${tab.title}</a></li>`;
        });

        menuContainer.innerHTML = menuHTML;
    } catch (error) {
        console.error('Lỗi tạo menu:', error);
    }
})();
