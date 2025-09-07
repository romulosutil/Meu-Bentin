// Substituição para campo de custo
<CurrencyInput
  id="custo"
  value={formData.custo}
  onChange={(valor) => setFormData(prev => ({ ...prev, custo: valor }))}
  className={`h-12 text-lg font-mono ${errors.custo ? 'border-red-500' : ''}`}
  minValue={0}
/>

// Substituição para campo de preço
<CurrencyInput
  id="preco"
  value={formData.preco}
  onChange={(valor) => setFormData(prev => ({ ...prev, preco: valor }))}
  className={`h-12 text-lg font-mono ${errors.preco ? 'border-red-500' : ''}`}
  minValue={0.01}
/>