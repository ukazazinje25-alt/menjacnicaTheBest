# Uklanjanje destinacija sekcija i premeštanje CTA nakon prednosti

$files = @("ria-money-transfer.html", "western-union.html", "moneygram.html", "kwikpay.html", "korona-pay.html")

foreach ($file in $files) {
    Write-Host "Obrađujem $file..." -ForegroundColor Green
    
    $content = Get-Content $file -Raw
    
    # Uklanjanje destinacija sekcija za svaki fajl
    if ($file -eq "ria-money-transfer.html") {
        $content = $content -replace '(?s)<!-- Popular Destinations -->.*?</section>', ''
    }
    elseif ($file -eq "western-union.html") {
        $content = $content -replace '(?s)<!-- Popular Destinations -->.*?</section>', ''
    }
    elseif ($file -eq "moneygram.html") {
        $content = $content -replace '(?s)<!-- Popular Destinations -->.*?</section>', ''
    }
    elseif ($file -eq "kwikpay.html") {
        $content = $content -replace '(?s)<!-- Popular Digital Currencies -->.*?</section>', ''
    }
    elseif ($file -eq "korona-pay.html") {
        $content = $content -replace '(?s)<!-- Popular CIS Destinations -->.*?</section>', ''
    }
    
    Set-Content $file $content -Encoding UTF8
    Write-Host "Završeno sa $file" -ForegroundColor Yellow
}