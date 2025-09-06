import { test, expect } from '@playwright/test';

const userID = '015';
const password = 'sk19950401';

const loginUrl = '/login';
const nfcUrl = '/nfc';

test.describe('NFC Flow E2E Test', () => {
  test('should allow a full login, clock-in, and clock-out flow', async ({ page }) => {
    // 1. ログインページにアクセス
    await page.goto(loginUrl);
    await expect(page).toHaveURL(loginUrl);

    // 2. ログイン情報を入力してログイン
    await page.getByLabel('ユーザー名').fill(userID);
    await page.getByLabel('パスワード').fill(password);
    await page.getByRole('button', { name: 'ログイン' }).click();

    // 3. NFCページにリダイレクトされることを確認
    await expect(page).toHaveURL(nfcUrl);

    // 作業内容のドロップダウンが表示されるまで待機
    const taskSelect = page.getByLabel('作業内容');
    await expect(taskSelect).toBeVisible();
    
    // ドロップダウンから最初のオプションを選択
    await taskSelect.selectOption({ index: 1 });

    // 「出勤を記録する」ボタンをクリック
    const clockInButton = page.getByRole('button', { name: '出勤を記録する' });
    await clockInButton.click();

    // 5. 退勤用の表示に切り替わることを確認
    const clockOutButton = page.getByRole('button', { name: '退勤する' });
    await expect(clockOutButton).toBeVisible();
    await expect(clockInButton).toBeHidden();

    // 6. 退勤ボタンをクリック
    await clockOutButton.click();

    // 7. 完了メッセージが表示され、再度出勤用の表示に戻ることを確認
    await expect(page.getByText('記録しました')).toBeVisible();
    await expect(clockInButton).toBeVisible();
    await expect(clockOutButton).toBeHidden();
  });
});

