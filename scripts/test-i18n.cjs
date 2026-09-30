// Run against the fixture backend (bun run dev), never a private save/server.
const { chromium } = require(process.env.PAL_LAB_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PAL_LAB_CHROMIUM ? { executablePath: process.env.PAL_LAB_CHROMIUM } : {}),
  });
  try {
    const context = await browser.newContext({ locale: 'fr-FR' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => localStorage.setItem('pal-lab.saveDir', 'fixture'));
    await page.goto(process.argv[2] || 'http://localhost:1420');
    const languages = page.getByRole('combobox', { name: 'Langue', exact: true });
    await languages.waitFor();
    assert.equal(await languages.inputValue(), 'fr', 'French browser selects French');
    const scope = page.getByRole('dialog');
    await scope.getByRole('button', { name: /Tous les joueurs/ }).click();
    await page.getByRole('button', { name: 'Liste', exact: true }).click();
    await page.locator('tr[data-pal]').first().waitFor();
    const search = page.getByLabel('Rechercher les Pals par nom', { exact: true });
    await search.fill('Anubis');
    const count = await page.locator('tr[data-pal]').count();
    await languages.selectOption('en');
    await page.getByRole('button', { name: /Save Inspector/ }).waitFor();
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    assert.equal(await page.getByLabel('Search pals by name', { exact: true }).inputValue(), 'Anubis');
    assert.equal(await page.locator('tr[data-pal]').count(), count, 'Switch preserves filter results');
    await page.reload();
    await page.getByRole('combobox', { name: 'Language', exact: true }).waitFor();
    assert.equal(await page.getByRole('combobox', { name: 'Language', exact: true }).inputValue(), 'en');
    await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('fr');
    await page.getByRole('button', { name: /Reproduction/ }).click();
    await page.getByPlaceholder('ex. : Anubis').fill('Anubis');
    await page.getByPlaceholder('Rechercher un passif…').fill('legende');
    await page.getByRole('option', { name: /Légende/ }).click();
    await page.getByRole('combobox', { name: 'Langue', exact: true }).selectOption('en');
    assert.ok(await page.getByText('Legend', { exact: true }).count() > 0);
    await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('fr');
    await page.getByRole('button', { name: 'Calculer la reproduction', exact: true }).click();
    await page.getByRole('button', { name: 'Enregistrer le plan', exact: true }).waitFor({ timeout: 30000 });
    await page.getByRole('button', { name: 'Enregistrer le plan', exact: true }).click();
    await page.locator('input:focus').fill('Save plan');
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await page.getByRole('button', { name: /Plans/ }).last().click();
    await page.getByTitle('Save plan', { exact: true }).waitFor();
    await page.getByRole('combobox', { name: 'Langue', exact: true }).selectOption('en');
    await page.getByTitle('Save plan', { exact: true }).waitFor();
    assert.deepEqual(errors, [], 'No browser runtime errors');
    await context.close();
    const other = await browser.newContext({ locale: 'de-DE' });
    const fresh = await other.newPage();
    await fresh.goto(process.argv[2] || 'http://localhost:1420');
    await fresh.getByRole('combobox', { name: 'Language', exact: true }).waitFor();
    assert.equal(await fresh.locator('html').getAttribute('lang'), 'en', 'Unsupported browser language uses English');
    await other.close();
    console.log('i18n: language defaults, switch, persistence, searches, filters, solve and custom plan name verified');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
