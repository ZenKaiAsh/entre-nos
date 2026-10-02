/* Textos da area "Para voce". Edite, apague ou acrescente objetos livremente.
   Campos: id (unico), title, icon (mail, moon, heart, heartf, sun, thought, key, calendar),
   text (use uma linha em branco para separar paragrafos),
   unlockDate (opcional, "AAAA-MM-DD": so abre a partir dessa data, pelo relogio do aparelho). */
const romanticTexts = [
  { id:"carta", title:"Uma cartinha para você", icon:"mail",
    text:"Às vezes eu paro e penso em como uma pessoa conseguiu se tornar tão importante para mim em tão pouco tempo.\n\nEscrevi este lugar com calma, do jeito que eu queria ter te dito tudo isso pessoalmente. Obrigado por existir na minha vida." },
  { id:"dormir", title:"Antes de dormir", icon:"moon",
    text:"Se a noite chegou e você está lendo isto, respira fundo. O dia acabou, e você fez o que pôde.\n\nDurma tranquila. Eu estou pensando em você, mesmo de longe." },
  { id:"saudade", title:"Quando sentir saudade", icon:"heart",
    text:"A saudade é só o amor sem lugar para ir. Então coloque uma música nossa para tocar e feche os olhos por um minuto.\n\nEu estou aí, do jeito que dá, até a gente se ver de novo." },
  { id:"amo", title:"Por que eu amo você", icon:"heartf",
    text:"Pelo seu jeito de rir quando acha que ninguém está olhando.\n\nPela forma como você torna os dias comuns mais leves.\n\nPorque, com você, eu me sinto em casa." },
  { id:"bomdia", title:"Bom dia, meu amor", icon:"sun",
    text:"Bom dia. Que hoje seja gentil com você, que o café esteja bom e que alguma coisa pequena te faça sorrir.\n\nEu torço por você em cada passo do dia." },
  { id:"penso", title:"Coisas que penso sobre você", icon:"thought",
    text:"Penso que você é forte, mesmo quando não percebe.\n\nPenso que a gente ainda tem muita história para escrever.\n\nPenso em você mais do que eu admito." },
  { id:"segredo", title:"Um segredo", icon:"key", unlockDate:"2026-10-10",
    text:"Aqui vai um segredo que eu guardei até hoje: eu já gostava de você muito antes de ter coragem de dizer.\n\nAinda bem que eu tive." },
  { id:"dois-meses", title:"Nossos 2 meses", icon:"calendar",
    text:"Dois meses. Parece pouco no calendário, mas para mim foi o tempo de aprender seu jeito, suas manias e o que eu quero guardar para sempre.\n\nFeliz 2 meses, meu amor. Que venham muitos outros." },
  { id:"futuro", title:"Uma surpresa", icon:"key", unlockDate:"2026-12-10",
    text:"Você chegou até aqui, então é hora de abrir esta mensagem. Eu tenho uma surpresa preparada para os nossos 4 meses.\n\nEdite este texto com o que você quiser." }
];
