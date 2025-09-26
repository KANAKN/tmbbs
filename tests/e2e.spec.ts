import { test, expect } from '@playwright/test';

// テストで使用するランダムなユーザー情報
const testUser = {
  email: `testuser_${Date.now()}@example.com`,
  password: 'password123',
  username: `TestUser${Date.now()}`,
};

const testQuestion = {
  title: `Playwright test question ${Date.now()}`,
  description: 'This is a test question created by an automated Playwright script.',
};

const testAnswer = {
  content: 'This is a test answer created by an automated Playwright script.',
};

test.describe('Full user journey test for tmbbs.vercel.app', () => {
  const baseURL = 'https://tmbbs.vercel.app/';

  test('should allow a user to sign up, post a question, answer it, and set a best answer', async ({ page }) => {
    // 1.1 & 1.7: トップページ表示と未ログイン状態の確認
    await page.goto(baseURL);
    await expect(page.getByRole('link', { name: 'ログイン' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'アカウント作成' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '質問リスト' })).toBeVisible();

    // 2.1 & 2.2: 新規ユーザー登録と自動ログイン
    await page.getByRole('link', { name: 'アカウント作成' }).click();
    await expect(page).toHaveURL(`${baseURL}signup`);
    await page.getByLabel('メールアドレス').fill(testUser.email);
    await page.getByLabel('パスワード').fill(testUser.password);
    await page.getByRole('button', { name: '登録する' }).click();
    
    // サインアップ後の自動ログインとリダイレクトを待機（タイムアウトを延長）
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible({ timeout: 60000 });
    await expect(page).toHaveURL(baseURL);

    // プロフィールを編集してユーザー名を設定
    await page.getByRole('link', { name: 'プロフィール編集' }).click();
    await expect(page).toHaveURL(`${baseURL}profile/edit`);
    await page.getByLabel('ユーザー名').fill(testUser.username);
    await page.getByRole('button', { name: '更新する' }).click();
    await page.waitForTimeout(2000); // 更新処理を待つ

    // 2.3: 新しい質問を投稿
    await page.goto(baseURL);
    await page.getByRole('link', { name: '質問を投稿する' }).click();
    await expect(page).toHaveURL(`${baseURL}questions/new`);
    await page.getByLabel('タイトル').fill(testQuestion.title);
    await page.getByLabel('本文').fill(testQuestion.description);
    await page.getByRole('button', { name: '投稿する' }).click();
    await page.waitForURL(new RegExp(`${baseURL}questions/\\w+`));
    await expect(page.getByRole('heading', { name: testQuestion.title })).toBeVisible();
    await expect(page.getByText(testQuestion.description)).toBeVisible();

    // 2.4: 投稿した質問に自分で回答する
    await page.getByRole('textbox').fill(testAnswer.content);
    await page.getByRole('button', { name: '回答を投稿する' }).click();
    await page.waitForTimeout(2000); // 投稿処理を待つ
    await expect(page.getByText(testAnswer.content)).toBeVisible();

    // 3.1: 投稿された回答をベストアンサーに設定
    await expect(page.getByRole('button', { name: 'ベストアンサーに設定' })).toBeVisible();
    await page.getByRole('button', { name: 'ベストアンサーに設定' }).click();
    await page.waitForTimeout(2000); // 設定処理を待つ
    await expect(page.getByRole('heading', { name: 'ベストアンサー' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ベストアンサーに設定' })).not.toBeVisible();
  });
});