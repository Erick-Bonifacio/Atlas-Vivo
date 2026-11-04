# Dificuldade das questões oficiais

## ENEM: dificuldade estimada pela TRI

O INEP calibra os itens do ENEM pelo modelo logístico de três parâmetros (a, b, c). Os microdados (`ITENS_PROVA_<ano>.csv`) trazem os parâmetros de cada item na escala (0, 1), em que theta = 0 corresponde a 500 pontos da escala do ENEM (documento *Procedimentos de análise do ENEM*, no pacote dos microdados). O parâmetro `c` é uma probabilidade e não muda de escala.

Para cada item calculamos a probabilidade de acerto de um participante de referência e, dela, a parte que não é acerto ao acaso:

```
P  = c + (1 - c) · p*                                   (probabilidade de acerto)
p* = 1 / (1 + exp(-D · a · (theta_ref - b)))            (probabilidade de dominar o item)     D = 1,7 · theta_ref = 0
```

A classificação usa **p\***, não P: o parâmetro `c` (acerto ao acaso) varia entre os itens e, em P, um item muito difícil com `c` alto pareceria mais fácil do que um item de dificuldade média. O app mostra o valor `p_ref` (= P) apenas como informação.

### Cortes

Os cortes **não são escolhidos à mão**. São os tercis da distribuição de `p*` entre todos os itens de Ciências da Natureza dos anos processados (`tools/ingest/difficulty_calibration.json`, recalculado por `python -I tools/ingest/run.py calibrate`):

- `p*` acima do segundo tercil: **Básica**;
- entre os dois tercis: **Intermediária**;
- `p*` abaixo do primeiro tercil: **Avançada**.

O arquivo de calibração registra o modelo, `D`, `theta_ref`, a métrica, os anos, o número de itens e os cortes. Como depende só dos arquivos oficiais, é reprodutível.

### O que o número significa e o que não significa

- É uma **estimativa por modelo** para um participante de proficiência de referência, não a taxa de acerto observada. No app aparece como "(estimada)" com explicação ao passar o cursor.
- Os tercis são relativos aos itens de CN do ENEM: "Avançada" quer dizer "entre o terço mais difícil dos itens de CN", não "difícil para qualquer estudante".
- A escolha `theta_ref = 0` e `D = 1,7` é uma convenção documentada, não foi validada contra respostas reais de participantes. Uma validação empírica (proporção de acertos por item nos microdados de resultados) é o próximo passo; não foi feita neste ciclo.

## Outras bancas

FUVEST, UNICAMP e UNESP não divulgam parâmetros por questão no material consultado. Para elas, a dificuldade será **estimada por rubrica** (número de passos de raciocínio, leitura de dados, integração entre sistemas) e marcada com `diff_method: "estimado"`, sempre exibida como estimada. Nenhum item dessas bancas foi processado neste ciclo (ver `docs/licencas.md`).
