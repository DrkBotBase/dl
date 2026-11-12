      const TERMS_ACCEPTED_KEY = 'mejv_terms_accepted_v1';
    
      function getUserId() {
        return localStorage.getItem('mejv_user_id');
      }
    
      function setUserId(id) {
        localStorage.setItem('mejv_user_id', id);
      }
    
      function hasAcceptedTerms() {
        return localStorage.getItem(TERMS_ACCEPTED_KEY) === 'true';
      }
    
      function showToast(message, isError = false) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        const toastIcon = document.getElementById('toast-icon');
        if (!toast || !toastMessage || !toastIcon) return;
    
        toastMessage.textContent = message;
    
        if (isError) {
          toast.classList.add('border-red-500/50');
          toastIcon.setAttribute('data-lucide', 'alert-circle');
          toastIcon.classList.replace('text-[#aaff00]', 'text-red-400');
        } else {
          toast.classList.remove('border-red-500/50');
          toastIcon.setAttribute('data-lucide', 'info');
          toastIcon.classList.replace('text-red-400', 'text-[#aaff00]');
        }
    
        if (window.lucide) lucide.createIcons();
    
        toast.classList.remove('opacity-0', 'pointer-events-none');
        toast.classList.add('opacity-100');
    
        setTimeout(() => {
          toast.classList.remove('opacity-100');
          toast.classList.add('opacity-0', 'pointer-events-none');
        }, 3500);
      }
    
      function initWelcomeModal() {
        const welcomeModal = document.getElementById('welcome-modal');
        const submitBtn = document.getElementById('welcome-submit-btn');
        const termsCheckbox = document.getElementById('terms-checkbox');
    
        if (!welcomeModal || !submitBtn || !termsCheckbox) return;
    
        if (!hasAcceptedTerms()) {
          welcomeModal.classList.remove('hidden');
          welcomeModal.classList.add('flex');
          document.body.style.overflow = 'hidden';
        }
    
        termsCheckbox.addEventListener('change', () => {
          submitBtn.disabled = !termsCheckbox.checked;
        });
    
        function closeWelcome() {
          localStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
          setUserId('guest');
          welcomeModal.classList.add('hidden');
          welcomeModal.classList.remove('flex');
          document.body.style.overflow = '';
          if (window.lucide) lucide.createIcons();
          maybeShowInstallBanner();
        }
    
        submitBtn.addEventListener('click', () => {
          if (termsCheckbox.checked) closeWelcome();
        });
      }
    
      function checkSharedLink() {
        const params = new URLSearchParams(window.location.search);
        let sharedUrl = params.get('url') || params.get('text') || params.get('title') || '';
        const urlMatch = sharedUrl.match(/https?:\/\/[^\s]+/);
        
        if (urlMatch) {
            sharedUrl = urlMatch[0];
        } else {
            return;
        }
    
        const input = document.getElementById('video-url');
        if (!input) return;
    
        input.value = sharedUrl;
        input.dispatchEvent(new Event('input'));
    
        if (typeof showToast === 'function') {
            showToast('Enlace cargado');
        }
      }
    
    async function checkAccess() {
        const appContent = document.getElementById('app-content');
        const maintenanceScreen = document.getElementById('maintenance-screen');
        if (!appContent || !maintenanceScreen) return;
    
        try {
          const res = await fetch('https://mejv.pro/api/access');
          const data = await res.json();
    
          if (data.status === true) {
            appContent.classList.remove('hidden');
            maintenanceScreen.classList.add('hidden');
            maintenanceScreen.classList.remove('flex');
            maybeShowInstallBanner();
          } else {
            appContent.classList.remove('hidden');
            maintenanceScreen.classList.add('hidden');
            maintenanceScreen.classList.remove('flex');
          }
        } catch (error) {
          console.warn('Error verificando acceso:', error);
          appContent.classList.add('hidden');
          maintenanceScreen.classList.remove('hidden');
          maintenanceScreen.classList.add('flex');
        }
      }
    
      const videoUrlInput = document.getElementById('video-url');
      const pasteBtn = document.getElementById('paste-btn');
      const optionsPanel = document.getElementById('options-panel');
      const platformBadge = document.getElementById('platform-badge');
      const formatContainer = document.getElementById('format-container');
      const qualityContainer  = document.getElementById('quality-container');
      const downloadBtn = document.getElementById('download-btn');
      const downloadBtnText = document.getElementById('download-btn-text');
    
      const imageModal = document.getElementById('image-modal');
      const closeModalBtn = document.getElementById('close-modal-btn');
      const modalImagesContainer = document.getElementById('modal-images-container');
      const modalImageCount = document.getElementById('modal-image-count');
    
      let currentPlatform = null;
      let selectedFormat = null;
      let selectedQuality = '360p';
      let currentUrl = '';
    
      function detectPlatform(url) {
        const cleanUrl = url.trim().toLowerCase();
        if (!cleanUrl) return null;
        if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) return 'youtube';
        if (cleanUrl.includes('spotify.com')) return 'spotify';
        if (cleanUrl.includes('tiktok.com')) return 'tiktok';
        if (cleanUrl.includes('pinterest.com') || cleanUrl.includes('pin.it')) return 'pinterest';
        if (cleanUrl.includes('instagram.com')) return 'instagram';
        if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch')) return 'facebook';
        return null;
      }
    
      function renderFormatOptions(platform) {
        currentPlatform = platform;
        selectedFormat = null;
        downloadBtn.classList.add('hidden');
        qualityContainer.classList.add('hidden');
    
        if (platform === 'youtube') {
          platformBadge.className = 'flex items-center space-x-1.5 text-xs font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30';
          platformBadge.innerHTML = `<i class="fa-brands fa-youtube text-sm"></i> <span>YouTube</span>`;
        } else if (platform === 'spotify') {
          platformBadge.className = 'flex items-center space-x-1.5 text-xs font-bold px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30';
          platformBadge.innerHTML = `<i class="fa-brands fa-spotify text-sm"></i> <span>Spotify</span>`;
        } else if (platform === 'tiktok') {
          platformBadge.className = 'flex items-center space-x-1.5 text-xs font-bold px-3 py-1 rounded-full bg-slate-200/20 text-white border border-slate-200/30';
          platformBadge.innerHTML = `<i class="fa-brands fa-tiktok text-sm"></i> <span>TikTok</span>`;
        } else if (platform === 'pinterest') {
          platformBadge.className = 'flex items-center space-x-1.5 text-xs font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-400/30';
          platformBadge.innerHTML = `<i class="fa-brands fa-pinterest text-sm"></i> <span>Pinterest</span>`;
        } else if (platform === 'instagram') {
          platformBadge.className = 'flex items-center space-x-1.5 text-xs font-bold px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30';
          platformBadge.innerHTML = `<i class="fa-brands fa-instagram text-sm"></i> <span>Instagram</span>`;
        } else if (platform === 'facebook') {
          platformBadge.className = 'flex items-center space-x-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30';
          platformBadge.innerHTML = `<i class="fa-brands fa-facebook text-sm"></i> <span>Facebook</span>`;
        }
    
        formatContainer.innerHTML = '';
    
        if (platform === 'youtube') {
          formatContainer.className = 'grid grid-cols-2 gap-3';
    
          const ytaBtn = document.createElement('button');
          ytaBtn.type = 'button';
          ytaBtn.className = 'format-opt-btn flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 font-medium text-xs hover:border-[#aaff00] hover:text-white transition-all';
          ytaBtn.innerHTML = `<i data-lucide="music" class="w-4 h-4 text-blue-400"></i><span>Audio</span>`;
          ytaBtn.onclick = () => selectFormat('audio', ytaBtn);
    
          const ytvBtn = document.createElement('button');
          ytvBtn.type = 'button';
          ytvBtn.className = 'format-opt-btn flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 font-medium text-xs hover:border-[#aaff00] hover:text-white transition-all';
          ytvBtn.innerHTML = `<i data-lucide="video" class="w-4 h-4 text-[#aaff00]"></i><span>Vídeo</span>`;
          ytvBtn.onclick = () => selectFormat('video', ytvBtn);
    
          formatContainer.appendChild(ytaBtn);
          formatContainer.appendChild(ytvBtn);
    
        } else if (platform === 'spotify') {
          formatContainer.className = 'grid grid-cols-1 gap-3';
          const spBtn = document.createElement('button');
          spBtn.type = 'button';
          spBtn.className = 'format-opt-btn flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-green-500/80 bg-green-600/20 text-green-400 font-medium text-xs transition-all shadow-sm shadow-green-500/30';
          spBtn.innerHTML = `<i data-lucide="music" class="w-4 h-4 text-green-400"></i><span>Audio</span>`;
          formatContainer.appendChild(spBtn);
          selectFormat('audio', spBtn);
    
        } else if (platform === 'tiktok') {
          formatContainer.className = 'grid grid-cols-1 gap-3';
          const ttBtn = document.createElement('button');
          ttBtn.type = 'button';
          ttBtn.className = 'format-opt-btn flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-slate-200/80 bg-slate-200/10 text-white font-medium text-xs transition-all shadow-sm';
          ttBtn.innerHTML = `<i data-lucide="video" class="w-4 h-4 text-red-400"></i><span>Vídeo / Carrusel</span>`;
          formatContainer.appendChild(ttBtn);
          selectFormat('video', ttBtn);
    
        } else if (platform === 'pinterest') {
          formatContainer.className = 'grid grid-cols-1 gap-3';
          const pinBtn = document.createElement('button');
          pinBtn.type = 'button';
          pinBtn.className = 'format-opt-btn flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-red-400/80 bg-red-400/10 text-red-400 font-medium text-xs transition-all shadow-sm';
          pinBtn.innerHTML = `<i data-lucide="video" class="w-4 h-4 text-red-400"></i><span>Vídeo / Carrusel</span>`;
          formatContainer.appendChild(pinBtn);
          selectFormat('image', pinBtn);
    
        } else if (platform === 'instagram') {
          formatContainer.className = 'grid grid-cols-1 gap-3';
          const inBtn = document.createElement('button');
          inBtn.type = 'button';
          inBtn.className = 'format-opt-btn flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-pink-200/80 bg-pink-400/10 text-pink-400 font-medium text-xs transition-all shadow-sm';
          inBtn.innerHTML = `<i data-lucide="video" class="w-4 h-4 text-pink-400"></i><span>Vídeo / Carrusel</span>`;
          formatContainer.appendChild(inBtn);
          selectFormat('image', inBtn);
        } else if (platform === 'facebook') {
          formatContainer.className = 'grid grid-cols-1 gap-3';
          const fbBtn = document.createElement('button');
          fbBtn.type = 'button';
          fbBtn.className = 'format-opt-btn flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-blue-500/80 bg-blue-600/20 text-blue-400 font-medium text-xs transition-all shadow-sm';
          fbBtn.innerHTML = `<i data-lucide="video" class="w-4 h-4 text-blue-400"></i><span>Vídeo / Imagen</span>`;
          formatContainer.appendChild(fbBtn);
          selectFormat('video', fbBtn);
        }
    
        optionsPanel.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
      }
    
      function selectFormat(format, clickedBtn) {
        selectedFormat = format;
    
        const allOptBtns = formatContainer.querySelectorAll('.format-opt-btn');
        allOptBtns.forEach(btn => {
          btn.classList.remove('border-[#aaff00]', 'bg-[#aaff00]/10', 'text-white', 'shadow-md', 'shadow-[#aaff00]/20');
          btn.classList.add('border-slate-700', 'bg-slate-800/80', 'text-slate-300');
        });
    
        if (clickedBtn) {
          clickedBtn.classList.remove('border-slate-700', 'bg-slate-800/80', 'text-slate-300');
          clickedBtn.classList.add('border-[#aaff00]', 'bg-[#aaff00]/10', 'text-white', 'shadow-md', 'shadow-[#aaff00]/20');
        }
    
        if (currentPlatform === 'youtube' && format === 'video') {
          qualityContainer.classList.remove('hidden');
          selectedQuality = '360p';
          updateQualityUI();
        } else {
          qualityContainer.classList.add('hidden');
        }
    
        downloadBtnText.textContent = 'Descargar';
        downloadBtn.classList.remove('hidden');
      }
    
      const qualityBtns = document.querySelectorAll('.quality-opt-btn');
    
      function updateQualityUI() {
        qualityBtns.forEach(btn => {
          if (btn.getAttribute('data-quality') === selectedQuality) {
            btn.classList.remove('border-slate-700', 'bg-slate-800/80', 'text-slate-300');
            btn.classList.add('border-[#aaff00]', 'bg-[#aaff00]/10', 'text-[#aaff00]');
          } else {
            btn.classList.remove('border-[#aaff00]', 'bg-[#aaff00]/10', 'text-[#aaff00]');
            btn.classList.add('border-slate-700', 'bg-slate-800/80', 'text-slate-300');
          }
        });
      }
    
      qualityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          selectedQuality = btn.getAttribute('data-quality');
          updateQualityUI();
        });
      });
    
      function openModal() {
        imageModal.classList.remove('hidden');
        imageModal.classList.add('flex');
        document.body.style.overflow = 'hidden';
      }
    
      function closeModal() {
        imageModal.classList.add('hidden');
        imageModal.classList.remove('flex');
        document.body.style.overflow = '';
      }
    
      if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    
      function downloadSingleImage(imgUrl, index) {
        showToast(`Descargando imagen ${index + 1}...`, false);
        const a = document.createElement('a');
        a.href = imgUrl;
        a.setAttribute('download', `tiktok_img_${index + 1}.jpg`);
        a.setAttribute('target', '_blank');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    
      if (videoUrlInput) {
        videoUrlInput.addEventListener('input', (e) => {
          const url = e.target.value;
          currentUrl = url;
          const platform = detectPlatform(url);
    
          if (!imageModal.classList.contains('hidden')) {
            closeModal();
            modalImagesContainer.innerHTML = '';
          }
    
          if (platform) {
            renderFormatOptions(platform);
          } else {
            optionsPanel.classList.add('hidden');
            downloadBtn.classList.add('hidden');
          }
        });
      }
    
      if (pasteBtn) {
        pasteBtn.addEventListener('click', async () => {
          try {
            const text = await navigator.clipboard.readText();
            videoUrlInput.value = text;
            videoUrlInput.dispatchEvent(new Event('input'));
            showToast('¡Enlace pegado!');
          } catch (err) {
            showToast('Por favor, Enlace manualmente.', true);
          }
        });
      }
    
      if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
          if (!selectedFormat || !currentPlatform || !currentUrl) return;
    
          const originalHtml = downloadBtn.innerHTML;
          downloadBtn.disabled = true;
          downloadBtn.classList.add('opacity-80', 'cursor-not-allowed');
          downloadBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Conectando...</span>
          `;
    
          try {
            const userId = getUserId() || 'guest';
    
            fetch('https://mejv.pro/api/track-usage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, platform: currentPlatform }),
              keepalive: true
            }).catch(err => console.warn('No se pudo registrar el uso:', err));
    
            let fetchUrl = `https://mejv.pro/api/resolve?url=${encodeURIComponent(currentUrl)}&type=${selectedFormat}&platform=${currentPlatform}`;
            if (currentPlatform === 'youtube' && selectedFormat === 'video') {
              fetchUrl += `&quality=${selectedQuality}`;
            }
    
            const response = await fetch(fetchUrl);
            const data = await response.json();
    
            if (!response.ok || !data.status) {
              throw new Error(data.error || 'Error al procesar el enlace.');
            }
    
            if (data.type === 'images' && data.data.images && data.data.images.length > 0) {
              showToast(`¡Se encontraron ${data.data.images.length} imágenes!`, false);
    
              modalImagesContainer.innerHTML = '';
              modalImageCount.textContent = data.data.images.length;
    
              data.data.images.forEach((imgUrl, index) => {
                const card = document.createElement('div');
                card.className = 'bg-slate-800/50 border border-slate-700/50 rounded-xl p-2 flex flex-col gap-2';
                card.innerHTML = `
                  <img src="${imgUrl}" alt="Imagen ${index + 1}" class="w-full h-48 object-cover rounded-lg bg-slate-900" loading="lazy">
                  <button class="w-full bg-[#0066ff] hover:bg-blue-600 text-white font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <i data-lucide="download" class="w-4 h-4"></i> Descargar Imagen ${index + 1}
                  </button>
                `;
                const btn = card.querySelector('button');
                btn.onclick = () => downloadSingleImage(imgUrl, index);
                modalImagesContainer.appendChild(card);
              });
    
              openModal();
              if (window.lucide) lucide.createIcons();
    
            } else {
              showToast('¡Descarga iniciada!', false);
              window.location.href = data.data.url;
            }
    
          } catch (error) {
            showToast(error.message, true);
          } finally {
            setTimeout(() => {
              downloadBtn.disabled = false;
              downloadBtn.classList.remove('opacity-80', 'cursor-not-allowed');
              downloadBtn.innerHTML = originalHtml;
              if (window.lucide) lucide.createIcons();
            }, 1500);
          }
        });
      }
    
      let deferredInstallPrompt = null;
      const installBanner = document.getElementById('install-banner');
      const installAction = document.getElementById('install-action');
      const installDismiss = document.getElementById('install-dismiss');
      const installLater = document.getElementById('install-later');
      const installDescription = document.getElementById('install-banner-description');
      const installTitle = document.getElementById('install-banner-title');
      const installDismissedKey = 'mejv-install-banner-dismissed';
    
      function isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
      }
    
      function isIOS() {
        return /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      }
    
      function wasDismissedRecently() {
        const dismissedAt = Number(localStorage.getItem(installDismissedKey));
        return dismissedAt && Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000;
      }
    
      function showInstallBanner({ ios = false } = {}) {
        const appContent = document.getElementById('app-content');
        if (!installBanner || !hasAcceptedTerms() || !appContent || appContent.classList.contains('hidden') || isStandalone() || wasDismissedRecently()) return;
    
        if (ios) {
          installTitle.textContent = 'Añade MEJV a tu inicio';
          installDescription.textContent = 'Pulsa Compartir y elige “Añadir a pantalla de inicio”.';
          installAction.textContent = 'Cómo instalar';
        }
    
        installBanner.classList.remove('hidden');
        installBanner.classList.add('install-banner-visible');
        if (window.lucide) lucide.createIcons();
      }
    
      function maybeShowInstallBanner() {
        if (isIOS()) {
          showInstallBanner({ ios: true });
        } else if (deferredInstallPrompt) {
          showInstallBanner();
        }
      }
    
      function hideInstallBanner(remember = false) {
        if (!installBanner) return;
        installBanner.classList.add('hidden');
        installBanner.classList.remove('install-banner-visible');
        if (remember) localStorage.setItem(installDismissedKey, String(Date.now()));
      }
    
      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredInstallPrompt = event;
        showInstallBanner();
      });
    
      installAction?.addEventListener('click', async () => {
        if (isIOS()) {
          showToast('Pulsa Compartir y después “Añadir a pantalla de inicio”.');
          return;
        }
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        console.log(`Resultado de instalación: ${outcome}`);
        deferredInstallPrompt = null;
        hideInstallBanner(outcome !== 'accepted');
      });
    
      installDismiss?.addEventListener('click', () => hideInstallBanner(true));
      installLater?.addEventListener('click', () => hideInstallBanner(true));
      window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;
        hideInstallBanner();
      });
    
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
          .then((registration) => registration.update())
          .then(() => console.log('SW On'))
          .catch(err => console.error('Error SW:', err));
      }
    
      document.addEventListener('DOMContentLoaded', () => {
        if (window.lucide) lucide.createIcons();
        
        const path = window.location.pathname;
        const input = document.getElementById('video-url');
        
        if (input) {
            if (path.includes('descargas-facebook')) input.placeholder = 'Enlace de Facebook aquí...';
            if (path.includes('descargas-instagram')) input.placeholder = 'Enlace de Instagram aquí...';
            if (path.includes('descargas-spotify')) input.placeholder = 'Enlace de Spotify aquí...';
            if (path.includes('descargas-tiktok')) input.placeholder = 'Enlace de TikTok aquí...';
            if (path.includes('descargas-youtube')) input.placeholder = 'Enlace de YouTube aquí...';
            if (path.includes('descargas-pinterest')) input.placeholder = 'Enlace de Pinterest aquí...';
        }
        
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const btn = item.querySelector('.faq-btn');
            const content = item.querySelector('.faq-content');
            const icon = item.querySelector('.faq-icon');
    
            btn.addEventListener('click', () => {
                const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';
    
                faqItems.forEach(otherItem => {
                    const otherContent = otherItem.querySelector('.faq-content');
                    const otherIcon = otherItem.querySelector('.faq-icon');
                    
                    otherContent.style.maxHeight = '0px';
                    otherContent.classList.add('opacity-0');
                    
                    otherIcon.style.transform = 'rotate(0deg)';
                });
                
                if (!isOpen) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.classList.remove('opacity-0');
                    
                    icon.style.transform = 'rotate(180deg)';
                }
            });
        });
        
        initWelcomeModal();
        checkSharedLink();
        checkAccess();
      });