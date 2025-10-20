# Configuration du Wallet avec Wagmi

## Étapes de configuration

### 1. Obtenir un Project ID WalletConnect

1. Allez sur [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Créez un compte ou connectez-vous
3. Créez un nouveau projet
4. Copiez votre **Project ID**

### 2. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=votre_project_id_ici
```

### 3. Fonctionnalités implémentées

✅ **Connexion multi-wallet** :
- Coinbase Wallet
- MetaMask (via Injected)
- WalletConnect (tous les wallets compatibles)

✅ **Affichage des informations** :
- Adresse du wallet (format court)
- Balance en temps réel
- Réseau connecté (Base)

✅ **Actions disponibles** :
- Copier l'adresse
- Déconnexion

### 4. Réseaux supportés

- **Base** (réseau principal)
- **Ethereum Mainnet** (fallback)

### 5. Utilisation

Le composant `WalletConnect` est déjà intégré dans le dashboard. Il affiche :

- **Non connecté** : Boutons pour chaque wallet disponible
- **Connecté** : Informations du wallet + bouton de déconnexion

### 6. Prochaines étapes

Pour ajouter plus de fonctionnalités :

1. **Transactions USDC** : Utiliser `useWriteContract` de Wagmi
2. **Lecture de contrats** : Utiliser `useReadContract`
3. **Switch de réseau** : Utiliser `useSwitchChain`
4. **ENS** : Utiliser `useEnsName` et `useEnsAvatar`

## Exemple d'utilisation dans un autre composant

```tsx
import { useAccount, useBalance } from 'wagmi';

function MyComponent() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <div>
      <p>Address: {address}</p>
      <p>Balance: {balance?.formatted} {balance?.symbol}</p>
    </div>
  );
}
```

## Ressources

- [Documentation Wagmi](https://wagmi.sh/)
- [WalletConnect Docs](https://docs.walletconnect.com/)
- [Base Network](https://base.org/)
