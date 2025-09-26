# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - navigation [ref=e4]:
      - link "Tech Mentor Logo" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "Tech Mentor Logo" [ref=e6] [cursor=pointer]
      - generic [ref=e7]:
        - link "ログイン" [ref=e8] [cursor=pointer]:
          - /url: /login
        - link "アカウント作成" [ref=e9] [cursor=pointer]:
          - /url: /signup
  - link "← 質問リストへ" [ref=e12] [cursor=pointer]:
    - /url: /
  - main [ref=e13]:
    - generic [ref=e15]:
      - heading "ログイン" [level=1] [ref=e16]
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]: メールアドレス
          - textbox "メールアドレス" [ref=e20]: testuser_1758864582815@example.com
        - generic [ref=e21]:
          - generic [ref=e22]: パスワード
          - textbox "パスワード" [ref=e23]: password123
        - button "ログイン" [active] [ref=e24]
      - paragraph [ref=e25]: "エラー: Invalid login credentials"
  - alert [ref=e26]
```