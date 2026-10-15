/**
 * @file scripts/audit_database.ts
 * Read-only diagnostic script to audit all existing collections in Firestore.
 * Does NOT modify or delete any data.
 */

import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

const COLLECTIONS_TO_CHECK = [
  'users',
  'adminProfiles',
  'sellerProfiles',
  'sellerApplications',
  'affiliateProfiles',
  'affiliateApplications',
  'products',
  'orders',
  'categories',
  'reviews',
  'returns',
  'disputes',
  'auditLogs',
  'adminNotifications',
  'campaigns',
  'supportTickets',
  'platformSettings'
];

async function runAudit() {
  console.log('=== MarketNest Firestore Read-Only Audit ===');
  console.log('Checking database connection and record counts...');

  for (const colName of COLLECTIONS_TO_CHECK) {
    try {
      const q = query(collection(db, colName), limit(50));
      const snap = await getDocs(q);
      console.log(`Collection [${colName}]: ${snap.size} documents found.`);
      if (!snap.empty) {
        snap.docs.slice(0, 3).forEach((d) => {
          const data = d.data();
          const previewKeys = Object.keys(data).slice(0, 5).join(', ');
          console.log(`   - Doc ID: ${d.id} | Keys: ${previewKeys}`);
          if (colName === 'users' || colName === 'adminProfiles') {
            console.log(`     Details: email=${data.email}, role=${data.role}`);
          }
        });
      }
    } catch (err: any) {
      console.log(`Collection [${colName}]: Error or permission denied - ${err.message}`);
    }
  }

  console.log('=== Audit Completed ===');
  process.exit(0);
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
