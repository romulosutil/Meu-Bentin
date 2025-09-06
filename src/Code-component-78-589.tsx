#!/usr/bin/env python3

# Script para buscar modais nos arquivos
import re

# Simulação para buscar padrões de modal
patterns = [
    r'<ModalBase.*?open={modal.*?}',
    r'Modal.*Vendedor',
    r'Modal.*Detalhes'
]

# Este seria usado para buscar nos arquivos reais
print("Padrões de busca para modais:")
for p in patterns:
    print(f"- {p}")