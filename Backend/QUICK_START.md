# 🚀 Guide de Démarrage Rapide - Hornet

## Configuration en 3 étapes

### 1️⃣ Obtenir un Project ID WalletConnect (GRATUIT)

1. Allez sur **[WalletConnect Cloud](https://cloud.walletconnect.com/)**
2. Cliquez sur **"Sign Up"** (ou connectez-vous si vous avez déjà un compte)
3. Créez un nouveau projet :
   - Nom du projet : `Hornet` (ou ce que vous voulez)
   - Type : `App`
4. Une fois créé, copiez le **Project ID** (format : `abc123def456...`)

### 2️⃣ Configurer les variables d'environnement

```bash
# Copiez le fichier d'exemple
cp .env.example .env.local

# Ouvrez .env.local et ajoutez votre Project ID
# Remplacez la ligne vide par :
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=votre_project_id_ici
```

### 3️⃣ Lancer l'application

```bash
# Installer les dépendances (si pas déjà fait)
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur ! 🎉

---

## ✨ Fonctionnalités du Wallet

### Connexion Wallet
- **Un seul bouton** "Connect Wallet" qui ouvre l'interface WalletConnect
- Support de **tous les wallets** compatibles WalletConnect :
  - MetaMask
  - Coinbase Wallet
  - Trust Wallet
  - Rainbow
  - Et 300+ autres wallets

### Vérifications Automatiques

#### ⚠️ Alerte si wallet non connecté
- Une bannière **jaune** apparaît en haut du dashboard
- Message : "Veuillez connecter votre wallet pour utiliser l'application"
- Disparaît automatiquement une fois connecté

#### 🔄 Changement automatique de réseau
- L'application détecte si vous êtes sur le bon réseau
- Si vous êtes sur un autre réseau (Ethereum, Polygon, etc.), un avertissement apparaît
- Bouton pour basculer automatiquement vers **Base Network**

### Informations Affichées

Quand le wallet est connecté :
- ✅ Adresse du wallet (format court : `0x1234...5678`)
- ✅ Balance en temps réel
- ✅ Réseau actuel avec indicateur de statut
- ✅ Bouton pour copier l'adresse
- ✅ Bouton pour changer de wallet
- ✅ Bouton pour se déconnecter

---

## 🌐 Réseau Supporté

**Base Network uniquement**
- Réseau : Base
- Chain ID : 8453
- RPC : Configuré automatiquement

L'application force automatiquement le réseau Base pour garantir la compatibilité.

---

## 🔧 Dépannage

### Le bouton "Connect Wallet" ne fonctionne pas
- Vérifiez que vous avez bien configuré `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` dans `.env.local`
- Redémarrez le serveur de développement : `Ctrl+C` puis `npm run dev`

### L'alerte jaune ne disparaît pas
- Assurez-vous que votre wallet est bien connecté
- Rafraîchissez la page

### Le wallet ne se connecte pas au bon réseau
- Cliquez sur le bouton "Basculer vers Base" dans l'avertissement
- Ou changez manuellement de réseau dans votre wallet

---

## 📚 Prochaines Étapes

Une fois le wallet connecté, vous pouvez :
1. Déposer des USDC
2. Activer l'optimisation AI
3. Suivre vos performances
4. Retirer vos fonds à tout moment

---

## 🆘 Besoin d'aide ?

- Documentation Wagmi : https://wagmi.sh/
- Documentation WalletConnect : https://docs.walletconnect.com/
- Base Network : https://base.org/

Bon yield farming ! 🐝💰
