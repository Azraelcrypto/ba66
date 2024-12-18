// Constants
const NETWORKS = {
  EVM: {
    name: 'EVM Networks',
    description: 'Ethereum, BSC, Polygon, Fantom, etc',
    icons: [
      { url: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg', alt: 'Ethereum' },
      { url: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg', alt: 'BSC' },
      { url: 'https://cryptologos.cc/logos/polygon-matic-logo.svg', alt: 'Polygon' },
      { url: 'https://cryptologos.cc/logos/fantom-ftm-logo.svg', alt: 'Fantom' }
    ]
  },
  TRON: {
    name: 'Tron',
    description: 'Tron Network',
    svg: `<svg id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><style>.cls-1{fill:#ff060a;}</style></defs><title>tron</title><g id="tron"><path class="cls-1" d="M61.55,19.28c-3-2.77-7.15-7-10.53-10l-.2-.14a3.82,3.82,0,0,0-1.11-.62l0,0C41.56,7,3.63-.09,2.89,0a1.4,1.4,0,0,0-.58.22L2.12.37a2.23,2.23,0,0,0-.52.84l-.05.13v.71l0,.11C5.82,14.05,22.68,53,26,62.14c.2.62.58,1.8,1.29,1.86h.16c.38,0,2-2.14,2-2.14S58.41,26.74,61.34,23a9.46,9.46,0,0,0,1-1.48A2.41,2.41,0,0,0,61.55,19.28ZM36.88,23.37,49.24,13.12l7.25,6.68Zm-4.8-.67L10.8,5.26l34.43,6.35ZM34,27.27l21.78-3.51-24.9,30ZM7.91,7,30.3,26,27.06,53.78Z"/></g></svg>`
  }
};

class WalletConnector {
  constructor() {
    this.modal = null;
    this.networkFrame = null;
    this.init();
  }

  createModalHTML() {
    const modalHTML = `
      <div class="wallet-modal" id="walletModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Connect wallet</h2>
            <button class="modal-close" id="closeModal">&times;</button>
          </div>
          <p class="modal-subtitle">Select a network</p>
          <div class="network-options">
            <div class="network-option" data-network="EVM">
              <div class="network-icons">
                ${NETWORKS.EVM.icons.map(icon => `
                  <img src="${icon.url}" alt="${icon.alt}" class="network-logo">
                `).join('')}
              </div>
              <div class="network-info">
                <h3>${NETWORKS.EVM.name}</h3>
                <p>${NETWORKS.EVM.description}</p>
              </div>
            </div>
            <div class="network-option" data-network="TRON">
              <div class="network-icons tron-logo">
                ${NETWORKS.TRON.svg}
              </div>
              <div class="network-info">
                <h3>${NETWORKS.TRON.name}</h3>
                <p>${NETWORKS.TRON.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="network-frame-container" id="networkFrameContainer">
        <div class="network-frame-wrapper">
          <button class="close-frame" id="closeFrame">&times;</button>
          <iframe id="networkFrame" class="network-frame"></iframe>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  init() {
    this.createModalHTML();
    this.modal = document.getElementById('walletModal');
    this.networkFrame = document.getElementById('networkFrame');
    this.frameContainer = document.getElementById('networkFrameContainer');
    this.closeBtn = document.getElementById('closeModal');
    this.closeFrameBtn = document.getElementById('closeFrame');
    this.networkOptions = this.modal.querySelectorAll('.network-option');
    this.initEventListeners();
    this.addStyles();
  }

  initEventListeners() {
    document.querySelectorAll('.connectWallet').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });

    this.closeBtn.addEventListener('click', () => this.close());
    this.closeFrameBtn.addEventListener('click', () => this.closeFrame());
    
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    this.frameContainer.addEventListener('click', (e) => {
      if (e.target === this.frameContainer) this.closeFrame();
    });

    this.networkOptions.forEach(option => {
      option.addEventListener('click', () => {
        const network = option.dataset.network;
        this.handleNetworkSelection(network);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.frameContainer.classList.contains('active')) {
          this.closeFrame();
        } else if (this.modal.classList.contains('active')) {
          this.close();
        }
      }
    });

    // Handle iframe load event
    this.networkFrame.addEventListener('load', () => {
      this.frameContainer.classList.add('frame-loaded');
    });
  }

  addStyles() {
    const styles = `
      .wallet-modal {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .wallet-modal.active {
        opacity: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 16px;
        width: 100%;
        max-width: 480px;
        transform: translateY(20px);
        opacity: 0;
        transition: all 0.3s ease;
      }

      .wallet-modal.active .modal-content {
        transform: translateY(0);
        opacity: 1;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .modal-header h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
      }

      .modal-close, .close-frame {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
        color: #666;
        transition: color 0.2s ease;
      }

      .modal-close:hover, .close-frame:hover {
        color: #000;
      }

      .network-options {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .network-option {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid #eee;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .network-option:hover {
        border-color: #0500FF;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }

      .network-icons {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        width: 40px;
      }

      .network-logo {
        width: 16px;
        height: 16px;
      }

      .network-info h3 {
        margin: 0 0 0.25rem;
        font-size: 1rem;
      }

      .network-info p {
        margin: 0;
        font-size: 0.875rem;
        color: #666;
      }

      /* Network Frame Styles */
      .network-frame-container {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 2rem;
      }

      .network-frame-container.active {
        display: flex;
        opacity: 1;
        align-items: center;
        justify-content: center;
      }

      .network-frame-wrapper {
        background: white;
        border-radius: 16px;
        position: relative;
        width: 100%;
        max-width: 90%;
        max-height: 90vh;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }

      .frame-loaded .network-frame-wrapper {
        opacity: 1;
        transform: translateY(0);
      }

      .close-frame {
        position: absolute;
        right: 1rem;
        top: 1rem;
        z-index: 2;
        background: white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .network-frame {
        width: 100%;
        height: 80vh;
        border: none;
        display: block;
      }

      @media (max-width: 768px) {
        .network-frame-container {
          padding: 1rem;
        }

        .network-frame-wrapper {
          max-width: 100%;
          max-height: 100vh;
        }

        .network-frame {
          height: 100vh;
        }

        .close-frame {
          top: 0.5rem;
          right: 0.5rem;
        }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  open() {
    this.modal.style.display = 'flex';
    requestAnimationFrame(() => {
      this.modal.classList.add('active');
    });
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.remove('active');
    setTimeout(() => {
      this.modal.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  }

  openFrame(url) {
    this.networkFrame.src = url;
    this.frameContainer.style.display = 'flex';
    requestAnimationFrame(() => {
      this.frameContainer.classList.add('active');
    });
    document.body.style.overflow = 'hidden';
  }

  closeFrame() {
    this.frameContainer.classList.remove('active');
    setTimeout(() => {
      this.frameContainer.style.display = 'none';
      this.networkFrame.src = '';
      document.body.style.overflow = '';
    }, 300);
  }

  handleNetworkSelection(network) {
    this.close();
    if (network === 'EVM') {
      this.openFrame('eth.html');
    } else if (network === 'TRON') {
      this.openFrame('tron.html');
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WalletConnector();
});