# UI 컴포넌트 import 일괄 수정 스크립트

$uiPath = "src/components/ui"

Write-Host "🔍 UI 컴포넌트 파일 검색 중..." -ForegroundColor Yellow

Get-ChildItem -Path $uiPath -Filter *.tsx -Recurse | ForEach-Object {
    Write-Host "  📝 수정 중: $($_.Name)" -ForegroundColor Cyan
    
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    
    # 버전 번호 제거
    $content = $content -replace '@radix-ui/([^@"'']+)@[\d\.]+', '@radix-ui/$1'
    $content = $content -replace 'lucide-react@[\d\.]+', 'lucide-react'
    $content = $content -replace 'class-variance-authority@[\d\.]+', 'class-variance-authority'
    $content = $content -replace 'react-hook-form@[\d\.]+', 'react-hook-form'
    $content = $content -replace 'react-day-picker@[\d\.]+', 'react-day-picker'
    $content = $content -replace 'embla-carousel-react@[\d\.]+', 'embla-carousel-react'
    $content = $content -replace 'recharts@[\d\.]+', 'recharts'
    $content = $content -replace 'cmdk@[\d\.]+', 'cmdk'
    $content = $content -replace 'vaul@[\d\.]+', 'vaul'
    $content = $content -replace 'next-themes@[\d\.]+', 'next-themes'
    $content = $content -replace 'sonner@[\d\.]+', 'sonner'
    $content = $content -replace 'input-otp@[\d\.]+', 'input-otp'
    $content = $content -replace 'react-resizable-panels@[\d\.]+', 'react-resizable-panels'
    
    Set-Content $_.FullName -Value $content -Encoding UTF8 -NoNewline
}

Write-Host "✅ UI 컴포넌트 import 일괄 수정 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "다음 명령어로 확인하세요:" -ForegroundColor Yellow
Write-Host "  npm run type-check" -ForegroundColor Cyan




