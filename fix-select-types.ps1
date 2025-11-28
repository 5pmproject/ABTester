# Select onValueChange 타입 일괄 수정 스크립트

Write-Host "🔍 Select 타입 수정 시작..." -ForegroundColor Yellow

$files = @(
    "src\components\modules\CoursesModule.tsx",
    "src\components\modules\HospitalBranchesModule.tsx",
    "src\components\modules\ScheduleModule.tsx",
    "src\components\modules\TrainersModule.tsx",
    "src\components\modules\UserPermissionsModule.tsx"
)

$count = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  📝 수정 중: $file" -ForegroundColor Cyan
        
        $content = Get-Content $file -Raw -Encoding UTF8
        $content = $content -replace 'onValueChange=\{\(value\) =>', 'onValueChange={(value: string) =>'
        Set-Content $file -Value $content -Encoding UTF8 -NoNewline
        
        $count++
    } else {
        Write-Host "  ⚠️  파일 없음: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ $count 개 파일의 Select 타입 수정 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "다음 명령어로 확인하세요:" -ForegroundColor Yellow
Write-Host "  npm run type-check" -ForegroundColor Cyan

