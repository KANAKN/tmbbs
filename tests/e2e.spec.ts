import { test, expect } from '@playwright/test';

// テストで使用する既存のユーザー情報
const existingUser = {
  email: 'shigeru.yoshida@example.jp',
  password: 'password123',
};

const testQuestion = {
  title: `Playwright test question ${Date.now()}`,
  description: 'This is a test question created by an automated Playwright script.',
};

const testAnswer = {
  content: 'This is a test answer created by an automated Playwright script.',
};

test.describe('Logged-in user journey test for tmbbs.vercel.app', () => {
  const baseURL = 'https://tmbbs.vercel.app/';

  test('should allow a logged-in user to post a question and answer it', async ({ page }) => {
    // 1. トップページにアクセス
    await page.goto(baseURL);

    // 2.2: 既存のアカウントでログイン
    await page.getByRole('link', { name: 'ログイン' }).click();
    await expect(page).toHaveURL(`${baseURL}login`);
    await page.getByLabel('メールアドレス').fill(existingUser.email);
    await page.getByLabel('パスワード').fill(existingUser.password);
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // ログイン後のリダイレクトを待機
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible({ timeout: 60000 });
    await expect(page).toHaveURL(baseURL);

    // 2.3: 新しい質問を投稿
    await page.getByRole('link', { name: '質問を投稿する' }).click();
    await expect(page).toHaveURL(`${baseURL}questions/new`);
    await page.getByLabel('タイトル').fill(testQuestion.title);
    await page.getByLabel('内容').fill(testQuestion.description);
    // カテゴリを選択 (最初のオプションを選択)
    await page.getByLabel('カテゴリ').selectOption({ index: 1 });
    await page.getByRole('button', { name: '投稿する' }).click();
    
    // 投稿後のリダイレクトと表示を待機
    await page.waitForURL(new RegExp(`${baseURL}questions/\w+`));
    await expect(page.getByRole('heading', { name: testQuestion.title })).toBeVisible();
    await expect(page.getByText(testQuestion.description)).toBeVisible();

    // 2.4: 投稿した質問に自分で回答する
    await page.getByRole('textbox').fill(testAnswer.content);
    await page.getByRole('button', { name: 'コメントする' }).click();
    await page.waitForTimeout(2000); // 投稿処理を待つ
    await expect(page.getByText(testAnswer.content)).toBeVisible();

    // 3.1: ベストアンサー設定のテストは、別のユーザーフローが必要なため一旦スキップ
    // await expect(page.getByRole('button', { name: 'ベストアンサーに設定' })).toBeVisible();
    // await page.getByRole('button', { name: 'ベストアンサーに設定' }).click();
    // await page.waitForTimeout(2000); // 設定処理を待つ
    // await expect(page.getByRole('heading', { name: 'ベストアンサー' })).toBeVisible();
    // await expect(page.getByRole('button', { name: 'ベストアンサーに設定' })).not.toBeVisible();
  });
});
