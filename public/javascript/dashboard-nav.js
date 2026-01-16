document.addEventListener('DOMContentLoaded', function () {
    // Only run this logic if we are in the user dashboard context
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    // Only proceed if sidebar actually exists (dashboard pages)
    if (!sidebar || !mainContent) return;

    // Handle Sidebar Links
    sidebar.addEventListener('click', function (e) {
        // Find the closest anchor tag
        const link = e.target.closest('.nav-link');

        // If not a link, or if it's the Logout link, ignore.
        if (!link || link.getAttribute('href') === '/logout') return;

        // Prevent full reload
        e.preventDefault();

        const url = link.getAttribute('href');

        // Update Active State
        document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Show loading state
        mainContent.style.opacity = '0.5';
        mainContent.style.pointerEvents = 'none';

        // Fetch new content
        fetch(url)
            .then(response => response.text())
            .then(html => {
                // Parse the response
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Get the new main content
                const newContent = doc.querySelector('.main-content');

                if (newContent) {
                    mainContent.innerHTML = newContent.innerHTML;

                    // Update URL history
                    window.history.pushState({ path: url }, '', url);

                    // Update Page Title
                    document.title = doc.title;

                    // Re-initialize specific scripts if needed
                    // (Note: inline scripts in the fetched HTML won't run automatically via innerHTML)

                    // Important: If there are page-specific scripts (like Order View, Wallet), we might need to manually trigger them.
                    // For now, let's assume standard CSS/Bootstrap handles most things.

                    // Check if new content has scripts that need running?
                    const scripts = doc.querySelectorAll('script');
                    scripts.forEach(script => {
                        // Only run scripts that are page specific and likely found in the body/content
                        // This is risky, so we'll be minimal.
                        // Ideally checking for specific IDs to re-init.
                    });

                } else {
                    console.error('Could not find .main-content in fetched page');
                    // Fallback to full reload if something is wrong
                    window.location.href = url;
                }
            })
            .catch(err => {
                console.error('Navigation error:', err);
                window.location.href = url;
            })
            .finally(() => {
                // Restore state
                mainContent.style.opacity = '1';
                mainContent.style.pointerEvents = 'all';
            });
    });

    // Handle Back Button
    window.addEventListener('popstate', function () {
        // Simple fallback: reload to ensure correct state
        window.location.reload();
    });
});
