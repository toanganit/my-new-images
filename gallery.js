// gallery.js - Tự động load ảnh + đọc config.json (có token tránh lỗi 403)
(async function() {
    // =============================================
    // THAY ĐỔI 3 DÒNG DƯỚI ĐÂY
    const REPO_OWNER = 'toanganit';               // Username GitHub của bạn
    const REPO_NAME = 'my-new-images';            // Tên repo
    const TOKEN = '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';          // Token mới (hoặc để '' nếu không dùng)
    // =============================================

    const FOLDER = window.TAB_FOLDER;
    if (!FOLDER) {
        document.body.innerHTML = '<p>Thiếu tên thư mục.</p>';
        return;
    }

    const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FOLDER}`;
    const CONFIG_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${FOLDER}/config.json`;
    const IMG_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    // Hàm fetch có token (nếu có)
    async function authFetch(url) {
        const headers = {};
        if (TOKEN) {
            headers['Authorization'] = `token ${TOKEN}`;
        }
        return fetch(url, { headers });
    }

    // Đọc config
    async function loadConfig() {
        try {
            const res = await authFetch(CONFIG_URL);
            if (res.ok) return await res.json();
        } catch (e) { /* fallback */ }
        return {
            tabTitle: FOLDER,
            description: '',
            date: '',
            credit: '📷 Senya Maki'
        };
    }

    try {
        const config = await loadConfig();
        document.title = `Senya Maki | ${config.tabTitle}`;
        const titleEl = document.getElementById('tab-title');
        if (titleEl) titleEl.textContent = config.tabTitle;  // không còn 📷 mặc định

        const res = await authFetch(API_BASE);
        if (!res.ok) throw new Error('API trả về lỗi ' + res.status);
        const files = await res.json();
        const images = files.filter(f => IMG_EXTENSIONS.includes(f.name.split('.').pop().toLowerCase()));

        const container = document.getElementById('gallery-container');
        if (!container) return;
        container.innerHTML = images.length ? '' : '<p>まだ作品がありません。</p>';

        images.forEach(file => {
            const rawUrl = file.download_url;
            const title = file.name.replace(/\.[^/.]+$/, '');
            const div = document.createElement('div');
            div.className = 'gallery-item';
            div.innerHTML = `
                <img src="${rawUrl}" alt="${title}" loading="lazy">
                <div class="info">
                    <h3>${title}</h3>
                    ${config.description ? `<p class="desc">${config.description}</p>` : ''}
                    ${config.date ? `<p class="date">${config.credit}<br>${config.date}</p>` : ''}
                    <a href="${rawUrl}" target="_blank">オリジナル画像を表示</a>
                </div>`;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Gallery error:', error);
        const container = document.getElementById('gallery-container');
        if (container) container.innerHTML = '<p>画像を読み込めませんでした。</p>';
    }
})();
