body {
  font-family: Arial, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
}

.wallet-connect {
  text-align: center;
}

.wallet-button {
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid #dedede;
  display: flex;
  align-items: center;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease-in;
  cursor: pointer;
  user-select: none;
}

.wallet-button:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.wallet-icon {
  width: 32px;
  height: 32px;
  margin-right: 1rem;
  border-radius: 0.25rem;
}

.wallet-info {
  display: flex;
  flex-direction: column;
}

.wallet-name {
  font-weight: bold;
}

.wallet-description {
  opacity: 0.5;
  line-height: 1;
  font-style: italic;
}

.hidden {
  display: none;
}

.loading-spinner {
  border: 16px solid #f3f3f3;
  border-top: 16px solid #3498db;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
