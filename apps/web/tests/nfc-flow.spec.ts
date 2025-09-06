import { test, expect } from '@playwright/test';

const userID = '015';
const password = 'sk19950401';

const loginUrl = '/login';
const nfcUrl = '/nfc';

test.describe('NFC謇灘綾繝輔Ο繝ｼ縺ｮE2E繝・せ繝・, () => {
  test('繝ｭ繧ｰ繧､繝ｳ縲∝・蜍､縲・蜍､縺ｮ荳騾｣縺ｮ繝輔Ο繝ｼ縺梧ｭ｣蟶ｸ縺ｫ螳御ｺ・☆繧九％縺ｨ', async ({ page }) => {
    // 1. 繝ｭ繧ｰ繧､繝ｳ繝壹・繧ｸ縺ｫ繧｢繧ｯ繧ｻ繧ｹ
    await page.goto(loginUrl);
    await expect(page).toHaveURL(loginUrl);

    // 2. 繝ｭ繧ｰ繧､繝ｳ諠・ｱ繧貞・蜉帙＠縺ｦ繝ｭ繧ｰ繧､繝ｳ
    await page.getByLabel('ID').fill(userID);
    await page.getByLabel('繝代せ繝ｯ繝ｼ繝・).fill(password);
    await page.getByRole('button', { name: '繝ｭ繧ｰ繧､繝ｳ' }).click();

    // 3. NFC繝壹・繧ｸ縺ｫ繝ｪ繝繧､繝ｬ繧ｯ繝医＆繧後ｋ縺薙→繧堤｢ｺ隱・
    await expect(page).toHaveURL(nfcUrl);

    // 菴懈･ｭ蜀・ｮｹ縺ｮ繝峨Ο繝・・繝繧ｦ繝ｳ縺瑚｡ｨ遉ｺ縺輔ｌ繧九∪縺ｧ蠕・ｩ・
    const taskSelect = page.getByLabel('菴懈･ｭ蜀・ｮｹ');
    await expect(taskSelect).toBeVisible();
    
    // 繝峨Ο繝・・繝繧ｦ繝ｳ縺九ｉ譛蛻昴・繧ｪ繝励す繝ｧ繝ｳ繧帝∈謚・
    await taskSelect.selectOption({ index: 1 });

    // 縲悟・蜍､繧定ｨ倬鹸縺吶ｋ縲阪・繧ｿ繝ｳ繧偵け繝ｪ繝・け
    const clockInButton = page.getByRole('button', { name: '蜃ｺ蜍､繧定ｨ倬鹸縺吶ｋ' });
    await clockInButton.click();

    // 5. 騾蜍､逕ｨ縺ｮ陦ｨ遉ｺ縺ｫ蛻・ｊ譖ｿ繧上ｋ縺薙→繧堤｢ｺ隱・
    const clockOutButton = page.getByRole('button', { name: '騾蜍､縺吶ｋ' });
    await expect(clockOutButton).toBeVisible();
    await expect(clockInButton).toBeHidden();

    // 6. 騾蜍､繝懊ち繝ｳ繧偵け繝ｪ繝・け
    await clockOutButton.click();

    // 7. 謌仙粥繝｡繝・そ繝ｼ繧ｸ縺瑚｡ｨ遉ｺ縺輔ｌ縲∝・蠎ｦ蜃ｺ蜍､逕ｨ縺ｮ陦ｨ遉ｺ縺ｫ謌ｻ繧九％縺ｨ繧堤｢ｺ隱・
    await expect(page.getByText('險倬鹸縺励∪縺励◆')).toBeVisible();
    await expect(clockInButton).toBeVisible();
    await expect(clockOutButton).toBeHidden();
  });
});

