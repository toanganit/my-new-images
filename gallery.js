// gallery.js - Script dùng chung cho mọi tab ảnh
(async function() {
    // Lấy tên thư mục từ biến được khai báo trong file index.html của tab
    const FOLDER = window.TAB_FOLDER;
    if (!FOLDER) {
        document.body.innerHTML = '<p>Thiếu tên thư mục.</p>';
        return;
    }

    const REPO_OWNER = 'toanganit';  // ← THAY BẰNG USERNAME CỦA BẠN
    const REPO_NAME = 'my-new-images';  // ← THAY BẰNG TÊN REPO
    const GITHUB_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FOLDER}`;
    const CONFIG_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${FOLDER}/config.json`;
    const IMG_EXTENSIONS = ['jpg','jpeg','png','gif','webp'];

    // Hàm đọc config
    async function loadConfig() {
        try {
            const res = await fetch(CONFIG_URL);
            if (res.ok) return await res.json();
        } catch(e) {}
        // Giá trị mặc định nếu không có config
        return {
            tabTitle: FOLDER,
            description: '',
            date: '',
            credit: '📷 Senya Maki'
        };
    }

    // Lấy danh sách ảnh và render
    try {
        const config = await loadConfig();
        document.title = `Senya Maki | ${config.tabTitle}`;
        document.getElementById('tab-title').textContent = `📷 ${config.tabTitle}`;

        const res = await fetch(GITHUB_API);
        if (!res.ok) throw new Error('API error');
        const files = await res.json();
        const images = files.filter(f => IMG_EXTENSIONS.includes(f.name.split('.').pop().toLowerCase()));

        const container = document.getElementById('gallery-container');
        container.innerHTML = images.length ? '' : '<p>まだ作品がありません。</p>';

        images.forEach(file => {
            const raw = file.download_url;
            const title = file.name.replace(/\.[^/.]+$/, '');
            const div = document.createElement('div');
            div.className = 'gallery-item';
            div.innerHTML = `
                <img src="${raw}" alt="${title}" loading="lazy">
                <div class="info">
                    <h3>${title}</h3>
                    ${config.description ? `<p class="desc">${config.description}</p>` : ''}
                    ${config.date ? `<p class="date">${config.credit}<br>${config.date}</p>` : ''}
                    <a href="${raw}" target="_blank">オリジナル画像を表示</a>
                </div>`;
            container.appendChild(div);
        });
    } catch(e) {
        document.getElementById('gallery-container').innerHTML = '<p>画像を読み込めませんでした。</p>';
    }
    const res = await fetch(GITHUB_API, {
    headers: { Authorization: `token ${TOKEN}` }
});
})();
