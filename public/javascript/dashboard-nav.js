document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    // Only proceed if sidebar actually exists (dashboard pages)
    if (!sidebar || !mainContent) return;

    // Helper: Execute scripts in the new content
    function executeScripts(container) {
        const scripts = container.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');

            // Copy attributes (src, type, etc.)
            Array.from(script.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });

            // Copy content
            newScript.textContent = script.textContent;

            // Insert and run
            script.parentNode.replaceChild(newScript, script);
        });
    }

    // Helper: Inject styles from the new page
    function injectStyles(doc) {
        // Handle inline <style> tags
        const styles = doc.querySelectorAll('style');
        styles.forEach(style => {
            // Append new styles. We do NOT clear old ones to preserve structure.
            document.head.appendChild(style.cloneNode(true));
        });

        // Handle <link> stylesheet tags
        const links = doc.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(link => {
            if (!document.querySelector(`link[href="${link.getAttribute('href')}"]`)) {
                const newLink = document.createElement('link');
                newLink.rel = 'stylesheet';
                newLink.href = link.getAttribute('href');
                document.head.appendChild(newLink);
            }
        });
    }

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

        // Show loading state with smooth transition
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(10px)';
        mainContent.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

        // Fetch new content
        setTimeout(() => {
            fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.text();
                })
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');

                    // 1. Get new main content
                    const newContent = doc.querySelector('.main-content');

                    if (newContent) {
                        // 2. Inject Styles (Critical for the UI fix)
                        injectStyles(doc);

                        // 3. Update DOM
                        mainContent.innerHTML = newContent.innerHTML;

                        // 4. Update Page Title
                        document.title = doc.title;

                        // 5. Update URL history
                        window.history.pushState({ path: url }, '', url);

                        // 6. Execute Scripts (Critical for functionality)
                        executeScripts(mainContent);

                    } else {
                        // Fallback: If for some reason we can't find content, reload.
                        window.location.href = url;
                    }
                })
                .catch(err => {
                    console.error('Navigation error:', err);
                    window.location.href = url; // Fallback to full reload on error
                })
                .finally(() => {
                    // Restore state with animation
                    setTimeout(() => {
                        mainContent.style.opacity = '1';
                        mainContent.style.transform = 'translateY(0)';
                    }, 50);
                });
        }, 200); // Small delay for the fade-out animation
    });

    // Handle Back Button
    window.addEventListener('popstate', function () {
        window.location.reload();
    });
});
