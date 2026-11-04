// Atlas Vivo — aula aprofundada: sistema urinário. Texto original em português, escrito para este projeto.
(window.AV_LESSON_DEEP = window.AV_LESSON_DEEP || {}).urinario = {
  dur: 55,
  lead: 'Como os rins filtram o sangue, ajustam a água e os sais do corpo e eliminam resíduos, e como o sistema nervoso e os hormônios regulam esse trabalho.',
  goals: [
    'Descrever as estruturas do sistema urinário e o trajeto da urina.',
    'Explicar as etapas de formação da urina no néfron: filtração, reabsorção e secreção.',
    'Interpretar a ação do ADH, da aldosterona e de outros hormônios no equilíbrio hídrico e iônico.',
    'Relacionar a excreção ao metabolismo de proteínas e à regulação do pH.',
    'Reconhecer doenças e situações de risco, como cálculos, infecções, diabetes e insuficiência renal.'],
  enem: [
    'Néfron: filtração glomerular, reabsorção e secreção.',
    'ADH e desidratação; diabetes insipidus; ingestão de sal e hipertensão.',
    'Excreção nitrogenada: amônia, ureia e ácido úrico em diferentes grupos animais.',
    'Hemodiálise, insuficiência renal e transplante.',
    'Cálculos renais e infecções urinárias; hidratação.'],
  refs: [
    ['OpenStax — Anatomia e Fisiologia 2e, cap. 25: O sistema urinário', 'https://openstax.org/books/anatomy-and-physiology-2e/pages/25-introduction', 'CC BY-NC-SA 4.0, consulta para conferir fatos; texto próprio'],
    ['Ministério da Saúde — Biblioteca Virtual em Saúde (BVS/MS)', 'https://bvsms.saude.gov.br/', 'publicações oficiais, consulta'],
    ['Matriz de Referência do Enem (Inep)', 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem', 'documento oficial']],
  secs: [
    { ch: 'Cap. 1, Visão geral', t: 'Para que servem os rins', h: 'Mais do que “fazer xixi”', m: { sys: ['urinario'] }, b: [
      { p: 'Os rins recebem cerca de um quarto do débito cardíaco em repouso. Com esse sangue, fazem seis trabalhos: eliminam resíduos do metabolismo (principalmente ureia), regulam o volume de água, controlam a concentração de íons (sódio, potássio, cálcio, fosfato), ajudam a manter o pH do sangue, participam da regulação da pressão arterial e produzem hormônios (eritropoetina e a forma ativa da vitamina D) e a enzima renina.' },
      { fig: 'r-urinario', cap: 'Rins, ureteres e bexiga no abdome: a parte do sistema que forma e conduz a urina.' },
      { p: 'O sistema urinário é formado por dois rins, dois ureteres, a bexiga e a uretra. A urina é produzida nos rins, descida pelos ureteres por contrações peristálticas, armazenada na bexiga e eliminada pela uretra. Os rins ficam na região posterior do abdome, protegidos pelas últimas costelas e envolvidos por gordura.' },
      { fig: 'urinario', cap: 'Estruturas do sistema urinário.' },
      { recall: ['Por onde a urina passa depois de formada?', 'Pelo ureter (do rim à bexiga), fica armazenada na bexiga e sai pela uretra.'] },
    ] },
    { ch: 'Cap. 2, O néfron', t: 'Anatomia do rim e do néfron', h: 'Um milhão de filtros por rim', m: { sys: ['urinario'], parts: ['urinario', ['rim']] }, b: [
      { p: 'Cada rim tem córtex (externo), medula (interna, com as pirâmides) e pelve renal, que coleta a urina. A unidade funcional é o néfron, com cerca de um milhão por rim. Cada néfron tem um corpúsculo renal (glomérulo, um novelo de capilares, envolvido pela cápsula de Bowman) e um túbulo longo: túbulo contorcido proximal, alça de Henle, túbulo contorcido distal e ducto coletor.' },
      { fig: 'nefron', cap: 'O néfron e seus segmentos.' },
      { table: { cap: 'Segmentos do néfron e o que fazem', head: ['Segmento', 'Principal função'], rows: [
        ['Corpúsculo renal', 'Filtração do plasma sob pressão: água, sais, glicose e ureia passam; células e proteínas grandes ficam'],
        ['Túbulo contorcido proximal', 'Reabsorve cerca de dois terços da água e do sódio e quase toda a glicose e aminoácidos'],
        ['Alça de Henle', 'Cria o gradiente de concentração na medula, que permite concentrar a urina'],
        ['Túbulo contorcido distal', 'Ajuste fino de sódio, potássio e pH, sob ação da aldosterona'],
        ['Ducto coletor', 'Reabsorve água sob ação do ADH e conduz a urina até a pelve']] } },
    ] },
    { ch: 'Cap. 2, O néfron', t: 'Formação da urina', h: 'Filtrar, reabsorver, secretar', m: { sys: ['urinario', 'cardiovascular'] }, b: [
      { steps: { t: 'formação da urina', items: [
        'Filtração: a pressão do sangue no glomérulo empurra água e pequenos solutos para a cápsula de Bowman, formando o filtrado glomerular (cerca de 180 litros por dia).',
        'Reabsorção: ao longo dos túbulos, quase tudo o que o corpo precisa volta aos capilares que envolvem o néfron: mais de 99% da água, toda a glicose em condições normais, aminoácidos e grande parte dos sais.',
        'Secreção: algumas substâncias passam do sangue para o túbulo, como íons H⁺, K⁺ e certos medicamentos, ajustando o pH e eliminando o excesso.',
        'Excreção: o que resta (cerca de 1 a 2 litros por dia) é a urina, que segue pelos ductos coletores até a pelve renal.'] } },
      { warn: ['“Os rins filtram 1 a 2 litros por dia.”', 'Esse é o volume de urina. O volume filtrado é cerca de 180 litros por dia, e quase tudo volta ao sangue. Por isso pequenas alterações na reabsorção mudam muito o volume de urina.'] },
      { p: 'A presença de glicose ou de proteínas na urina é um sinal de alerta. Na hiperglicemia do diabetes mellitus, a quantidade de glicose filtrada supera a capacidade de reabsorção dos túbulos e parte da glicose é eliminada, levando água junto (poliúria) e provocando sede intensa. Proteínas na urina indicam lesão do filtro glomerular.' },
      { table: { cap: 'Composição aproximada da urina normal', head: ['Componente', 'Observação'], rows: [
        ['Água', 'Cerca de 95%'],
        ['Ureia', 'Principal soluto orgânico; vem do metabolismo das proteínas no fígado'],
        ['Íons (Na⁺, K⁺, Cl⁻, fosfatos)', 'Quantidade varia com a dieta e os hormônios'],
        ['Ácido úrico e creatinina', 'Do metabolismo de ácidos nucleicos e da massa muscular'],
        ['Glicose e proteínas', 'Ausentes na urina normal']] } },
    ] },
    { ch: 'Cap. 3, Regulação', t: 'Água, sais e hormônios', h: 'O rim obedece ao que o corpo precisa', m: { sys: ['urinario', 'endocrino'] }, b: [
      { p: 'Se a pessoa fica algumas horas sem beber água, a concentração do sangue aumenta. Receptores no hipotálamo detectam essa mudança, geram a sensação de sede e estimulam a hipófise posterior a liberar hormônio antidiurético (ADH). O ADH torna os ductos coletores mais permeáveis à água, que volta ao sangue. A urina fica menos volumosa e mais concentrada.' },
      { steps: { t: 'resposta à desidratação', items: [
        'A concentração (osmolaridade) do sangue aumenta.',
        'O hipotálamo detecta a mudança e libera ADH pela hipófise posterior; também surge a sede.',
        'O ADH aumenta a reabsorção de água no ducto coletor.',
        'O volume de urina diminui, a osmolaridade volta ao normal e o estímulo cai.'] } },
      { cols: [['ADH', 'Aumenta a reabsorção de água. Falta de ADH (diabetes insipidus) provoca grande volume de urina muito diluída e sede.'], ['Aldosterona', 'Produzida pelas glândulas suprarrenais, aumenta a reabsorção de sódio (e, junto, de água) e a secreção de potássio.'], ['Peptídeo natriurético atrial', 'Liberado pelo átrio quando a pressão aumenta; faz o rim eliminar mais sódio e água.']] },
      { p: 'Álcool inibe a liberação de ADH, e por isso a pessoa urina mais depois de beber. Diuréticos aumentam o volume de urina e são usados no tratamento de hipertensão e edema, sempre sob orientação. O excesso de sal na dieta aumenta o sódio no sangue, retém água e eleva a pressão arterial.' },
    ] },
    { ch: 'Cap. 3, Regulação', t: 'Excreção nitrogenada e pH', h: 'O destino do nitrogênio das proteínas', m: { sys: ['urinario', 'digestorio'] }, b: [
      { p: 'A degradação de aminoácidos e de ácidos nucleicos libera nitrogênio que o corpo não pode armazenar. A primeira forma é a amônia (NH₃), muito tóxica e solúvel, que exige muita água para ser diluída. No fígado de mamíferos, ela é transformada em ureia, bem menos tóxica, que o sangue leva até os rins.' },
      { table: { cap: 'Excreção nitrogenada em diferentes grupos', head: ['Grupo', 'Principal excreta', 'Relação com o ambiente'], rows: [
        ['Peixes ósseos e animais aquáticos', 'Amônia', 'Muita água disponível para diluir e eliminar'],
        ['Mamíferos e anfíbios adultos', 'Ureia', 'Menos tóxica, gasta menos água que a amônia'],
        ['Aves, répteis e insetos', 'Ácido úrico', 'Pouco solúvel; economiza água e permite o desenvolvimento do embrião em ovos com casca']] } },
      { p: 'Os rins também mantêm o pH do sangue em torno de 7,4: secretam H⁺ e reabsorvem bicarbonato, em conjunto com a ventilação, que elimina CO₂. Quando a regulação falha, ocorre acidose (pH baixo) ou alcalose (pH alto), que afetam proteínas, enzimas e o sistema nervoso.' },
    ] },
    { ch: 'Cap. 4, Saúde', t: 'Doenças e tratamentos', h: 'Quando os rins ou as vias urinárias falham', m: { sys: ['urinario'] }, b: [
      { table: { cap: 'Problemas urinários frequentes', head: ['Condição', 'O que acontece', 'Cuidados'], rows: [
        ['Infecção urinária', 'Bactérias (frequentemente E. coli) sobem pela uretra e infectam bexiga ou rins; mais comum em mulheres por a uretra ser mais curta', 'Higiene, hidratação, não segurar a urina; tratamento com antibiótico por orientação médica'],
        ['Cálculos renais', 'Cristais de sais (como oxalato e fosfato de cálcio, ácido úrico) formam “pedras” que obstruem as vias e provocam cólica intensa', 'Beber bastante água, moderar sal e carne em excesso; avaliação médica'],
        ['Glomerulonefrite', 'Inflamação do glomérulo, às vezes após infecção por estreptococos', 'Acompanhamento; pode afetar a pressão e a urina'],
        ['Doença renal crônica', 'Perda progressiva da função, principalmente por diabetes e hipertensão', 'Controle de glicemia e pressão; nas formas graves, diálise ou transplante'],
        ['Incontinência e retenção urinária', 'Falha do controle dos esfíncteres ou obstrução (por exemplo, aumento da próstata)', 'Avaliação médica']] } },
      { p: 'Na insuficiência renal grave, a hemodiálise cumpre parte do papel dos rins: o sangue do paciente passa por uma máquina e por uma membrana semipermeável, e o dialisado, de composição adequada, remove ureia e o excesso de líquidos e sais por difusão e ultrafiltração. Já o transplante renal substitui o órgão, e um único rim saudável é suficiente para a vida normal, razão pela qual é possível doar um rim em vida.' },
    ] },
    { ch: 'Cap. 5, Integração', t: 'O urinário e os outros sistemas', h: 'Nenhum rim trabalha sozinho', m: { sys: ['urinario', 'cardiovascular', 'nervoso', 'endocrino'] }, b: [
      { cols: [['Cardiovascular', 'O débito cardíaco leva sangue aos rins; os rins regulam o volume do sangue e a pressão arterial pela renina e pela reabsorção de sódio e água.'], ['Endócrino', 'ADH, aldosterona e peptídeo natriurético atuam nos néfrons; os rins produzem eritropoetina (formação de hemácias) e ativam a vitamina D.'], ['Nervoso', 'Hipotálamo e centros do tronco encefálico regulam a sede e o reflexo da micção; o controle voluntário do esfíncter externo é aprendido na infância.']] },
      { cols: [['Respiratório', 'Pulmões e rins mantêm juntos o pH do sangue.'], ['Digestório', 'Água e sais absorvidos pelo intestino são ajustados pelos rins; diarreia intensa reduz o volume de urina.'], ['Esquelético', 'Os rins participam do equilíbrio de cálcio e fosfato; a doença renal crônica pode afetar os ossos.']] },
      { note: ['Para integrar', 'Em um dia quente, a pessoa transpira e a concentração do sangue aumenta: ADH sobe, o rim reabsorve mais água, a urina fica escura e a sede aumenta. Digestório (absorção de água), tegumentar (suor), nervoso, endócrino e urinário participam da mesma resposta.'] },
    ] },
  ],
  sint: {
    text: 'Os rins filtram o sangue nos glomérulos, reabsorvem quase tudo o que o corpo precisa nos túbulos e secretam o que deve ser eliminado, formando a urina, que segue pelos ureteres, bexiga e uretra. O ADH e a aldosterona ajustam a reabsorção de água e sódio; os rins eliminam o nitrogênio do metabolismo na forma de ureia, ajudam a manter o pH e produzem hormônios. Doenças como diabetes e hipertensão são as principais causas de insuficiência renal crônica.',
    conf: [
      ['Ureter × uretra', 'Ureter liga rim e bexiga; uretra leva a urina da bexiga para o exterior.'],
      ['Filtrado × urina', 'O filtrado glomerular é cerca de 180 L/dia; a urina é de 1 a 2 L, o resto volta ao sangue.'],
      ['ADH × aldosterona', 'ADH aumenta a reabsorção de água; aldosterona aumenta a reabsorção de sódio.'],
      ['Amônia × ureia × ácido úrico', 'São três formas de excretar nitrogênio, com graus diferentes de toxicidade e de gasto de água.']],
    cards: [
      ['Qual é a unidade funcional do rim?', 'O néfron.'],
      ['O que acontece no glomérulo?', 'Filtração do plasma sob pressão para a cápsula de Bowman.'],
      ['Onde a maior parte da água é reabsorvida?', 'No túbulo contorcido proximal; o ajuste final, sob ação do ADH, ocorre no ducto coletor.'],
      ['Qual é o efeito do ADH?', 'Aumenta a permeabilidade à água do ducto coletor; a urina fica menos volumosa e mais concentrada.'],
      ['Por que aves excretam ácido úrico?', 'Porque é pouco solúvel, economiza água e é compatível com o desenvolvimento do embrião em ovo com casca.'],
      ['Por que o diabetes mellitus aumenta o volume de urina?', 'A glicose não reabsorvida arrasta água por osmose (poliúria).'],
      ['Para que serve a hemodiálise?', 'Para remover ureia e excesso de água e sais do sangue quando os rins não funcionam.']],
  },
};
