// Vercelの404エラーをデバッグするための最小限のページコンポーネント
export default function HomePage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Hello World!</h1>
      <p>このページが表示されれば、基本的なルーティングは正常に動作しています。</p>
      <p>問題の原因は、Supabaseとの連携やデータ取得処理にある可能性が高いです。</p>
    </div>
  )
}
