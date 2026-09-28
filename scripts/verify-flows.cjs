/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

async function scenario(browser, mobile) {
  const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile });
  const page = await context.newPage();
  const origin = 'http://127.0.0.1:3000';
  const visit = async (route) => { await page.goto(origin + route); await page.waitForTimeout(850); };

  // T1: pencarian dimulai kosong dan hanya versi aktif.
  await visit('/knowledge');
  assert.equal(await page.getByPlaceholder('Cari pengetahuan layanan...').inputValue(), '');
  assert.equal(await page.locator('select').nth(2).inputValue(), 'active');
  assert(await page.getByText('Panduan biaya item tambahan').count());
  await page.getByPlaceholder('Cari pengetahuan layanan...').fill('parkir');
  assert(await page.getByText('Penggunaan struk untuk parkir').count());
  await page.getByRole('button', { name: 'Hapus filter' }).click();
  assert.equal(await page.getByPlaceholder('Cari pengetahuan layanan...').inputValue(), '');
  assert.equal(await page.locator('select').nth(2).inputValue(), 'all');

  // T2: detail dapat dibuka dari pencarian dan riwayatnya tersedia.
  await page.getByRole('link', { name: 'Buka Penggunaan struk untuk parkir' }).click();
  await page.waitForURL('**/knowledge/panduan-struk-parkir');
  await page.getByRole('link', { name: 'Lihat riwayat versi' }).click();
  assert(await page.getByText('v1.3').count());

  // T3: laporan menampilkan nomor, status, dan langkah berikutnya.
  await visit('/knowledge/panduan-struk-parkir');
  await page.getByRole('link', { name: 'Laporkan informasi tidak sesuai' }).click();
  await page.getByRole('button', { name: 'Kirim laporan' }).click();
  assert(await page.getByText('Laporan berhasil dikirim').count());
  assert(await page.getByText('MENUNGGU TRIAGE').count());
  assert(await page.getByText('Langkah berikutnya').count());
  await page.reload();
  await page.getByText('Laporan berhasil dikirim').waitFor();
  assert(await page.getByText('MENUNGGU TRIAGE').count());
  if (!mobile) {
    const directory = path.join(__dirname, '..', 'docs', 'usability-evidence', 'after');
    fs.mkdirSync(directory, { recursive: true });
    await page.screenshot({ path: path.join(directory, 't3-konfirmasi-laporan-desktop.png'), fullPage: true });
  }

  // T4: tanggal menentukan status promo, termasuk promo yang sudah lewat.
  await visit('/promotions');
  assert(await page.getByText('Paket makan siang').count());
  await page.getByRole('tab', { name: 'AKAN BERAKHIR' }).click();
  assert(await page.getByText('Promo kartu bank terpilih').count());
  await page.getByRole('tab', { name: 'KEDALUWARSA' }).click();
  assert(await page.getByText('Promo keluarga periode Agustus').count());

  // T5: return -> form lama -> kirim ulang; versi aktif tetap terlihat.
  await visit('/review');
  await page.getByRole('button', { name: /Syarat promo akhir pekan/ }).click();
  assert(await page.getByText('Versi aktif v1.1 tetap tersedia').count());
  await page.getByRole('button', { name: 'Kembalikan revisi' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Kembalikan revisi' }).click();
  await page.waitForURL('**/knowledge/new?edit=syarat-promo-akhir-pekan&review=review-promo-12');
  assert.equal(await page.getByLabel('Judul pengetahuan').inputValue(), 'Syarat promo akhir pekan');
  assert.match(await page.getByLabel('Isi pengetahuan').inputValue(), /minimum transaksi/);
  await page.getByLabel('Isi pengetahuan').fill('Promo Sabtu dan Minggu berlaku untuk kartu terpilih, minimum transaksi Rp200.000, serta tidak dapat digabung promo lain.');
  await page.getByRole('button', { name: 'Kirim ulang revisi' }).click();
  await page.waitForURL('**/review');
  await page.waitForTimeout(850);
  await page.getByRole('button', { name: /Syarat promo akhir pekan/ }).click();
  assert(await page.getByText('Versi aktif v1.1 tetap tersedia').count());
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('pagi-sore-kms-v1')));
  const review = state.reviews.find((entry) => entry.id === 'review-promo-12');
  assert.equal(review.status, 'review');
  assert.equal(state.reviews.filter((entry) => entry.knowledgeId === 'syarat-promo-akhir-pekan').length, 1);
  assert.equal(state.knowledge.find((entry) => entry.id === 'syarat-promo-akhir-pekan').activeVersionId, 'ver-promo-11');
  await page.getByRole('button', { name: 'Setujui versi' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Setujui versi' }).click();
  await page.waitForURL('**/knowledge/syarat-promo-akhir-pekan/history');
  const approved = await page.evaluate(() => JSON.parse(localStorage.getItem('pagi-sore-kms-v1')));
  assert.equal(approved.knowledge.find((entry) => entry.id === 'syarat-promo-akhir-pekan').activeVersionId, 'ver-promo-12');
  assert.equal(approved.versions.find((entry) => entry.id === 'ver-promo-11').status, 'archived');

  if (mobile) {
    await page.getByRole('navigation', { name: 'Navigasi mobile' }).getByRole('link', { name: 'Cari' }).click();
    await page.waitForURL('**/knowledge');
  }
  await context.close();
  console.log(`${mobile ? 'mobile' : 'desktop'}: T1–T5 lulus`);
}

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  try { await scenario(browser, false); await scenario(browser, true); } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exit(1); });
