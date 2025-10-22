/**
 * Script de test pour vérifier la réponse de l'API DefiLlama
 */

const DEFILLAMA_API_BASE = 'https://yields.llama.fi';

async function testDefiLlamaAPI() {
  console.log('🔍 Test de l\'API DefiLlama...\n');
  
  try {
    console.log(`📡 Appel de l'API: ${DEFILLAMA_API_BASE}/pools`);
    const startTime = Date.now();
    
    const response = await fetch(`${DEFILLAMA_API_BASE}/pools`);
    const endTime = Date.now();
    
    console.log(`⏱️  Temps de réponse: ${endTime - startTime}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Headers:`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    console.log(`   Content-Length: ${response.headers.get('content-length')}`);
    
    if (!response.ok) {
      console.error(`❌ Erreur HTTP: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`📄 Réponse d'erreur: ${errorText.substring(0, 500)}`);
      return;
    }
    
    const data = await response.json();
    
    console.log('\n✅ Réponse reçue avec succès!');
    console.log('\n📦 Structure de la réponse:');
    console.log(`   Type: ${typeof data}`);
    console.log(`   Clés: ${Object.keys(data).join(', ')}`);
    
    if (data.status) {
      console.log(`   Status: ${data.status}`);
    }
    
    if (data.data) {
      console.log(`   Nombre de pools: ${data.data.length}`);
      
      if (data.data.length > 0) {
        console.log('\n📊 Exemple de pool (premier élément):');
        const firstPool = data.data[0];
        console.log(JSON.stringify(firstPool, null, 2));
        
        console.log('\n🔑 Propriétés du pool:');
        Object.keys(firstPool).forEach(key => {
          const value = firstPool[key];
          const type = typeof value;
          console.log(`   ${key}: ${type} = ${JSON.stringify(value).substring(0, 50)}`);
        });
        
        // Vérifier les propriétés essentielles
        console.log('\n✓ Vérification des propriétés essentielles:');
        const essentialProps = ['chain', 'project', 'symbol', 'tvlUsd', 'apy', 'pool'];
        essentialProps.forEach(prop => {
          const exists = prop in firstPool;
          const value = firstPool[prop];
          console.log(`   ${exists ? '✅' : '❌'} ${prop}: ${exists ? JSON.stringify(value) : 'MANQUANT'}`);
        });
        
        // Statistiques globales
        console.log('\n📈 Statistiques globales:');
        const pools = data.data;
        
        const totalTvl = pools.reduce((sum: number, p: any) => sum + (p.tvlUsd || 0), 0);
        const avgApy = pools.reduce((sum: number, p: any) => sum + (p.apy || 0), 0) / pools.length;
        const maxApy = Math.max(...pools.map((p: any) => p.apy || 0));
        const minApy = Math.min(...pools.map((p: any) => p.apy || 0));
        
        console.log(`   TVL Total: $${(totalTvl / 1e9).toFixed(2)}B`);
        console.log(`   APY Moyen: ${avgApy.toFixed(2)}%`);
        console.log(`   APY Max: ${maxApy.toFixed(2)}%`);
        console.log(`   APY Min: ${minApy.toFixed(2)}%`);
        
        // Compter les pools par chaîne
        const chainCounts: Record<string, number> = {};
        pools.forEach((p: any) => {
          if (p.chain) {
            chainCounts[p.chain] = (chainCounts[p.chain] || 0) + 1;
          }
        });
        
        console.log('\n⛓️  Top 10 chaînes par nombre de pools:');
        Object.entries(chainCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .forEach(([chain, count]) => {
            console.log(`   ${chain}: ${count} pools`);
          });
        
        // Compter les stablecoins
        const stablecoinCount = pools.filter((p: any) => p.stablecoin).length;
        console.log(`\n💵 Pools stablecoins: ${stablecoinCount} (${((stablecoinCount / pools.length) * 100).toFixed(1)}%)`);
        
      }
    } else {
      console.log('⚠️  Aucune propriété "data" trouvée dans la réponse');
      console.log('📄 Réponse complète:');
      console.log(JSON.stringify(data, null, 2).substring(0, 1000));
    }
    
  } catch (error) {
    console.error('\n❌ ERREUR lors du test:');
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
    } else {
      console.error(`   ${error}`);
    }
  }
}

// Exécuter le test
testDefiLlamaAPI();
