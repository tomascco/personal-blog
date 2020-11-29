---
template: post
title: "Blocos e Lambdas: Interfaces em Ruby"
slug: blocos-e-lambdas
draft: true
date: 2020-11-29T16:57:23.168Z
description: Blocos são um recurso único da linguagem Ruby, Lambdas são a base
  da programação funcional. Qual a sua relação e como utilizar esses dois
  recursos para definir interfaces e melhorar a expressividade do seu código?
category: ruby
tags:
  - ruby
  - blocos
  - lambdas
---
Em Ruby, bloco é tudo aquilo delimitado por `do ... end` ou entre chaves `{ ... }`. Eles são usados nos métodos mais populares da linguagem e deixam o código muito mais expressivo, quem nunca viu alguns dos exemplos abaixo e ficou encantado?

```ruby
10.times do
  puts 'oi'
end
# oi
# oi
# oi
# ...

[1, 2, 3].map do {|n| n + 3 }
# => [4, 5, 6]
```

Os blocos são geralmente usados para declarar uma transformação ou procedimentos para serem passados executados em coleções ou em objetos. Além disso, [podem ser usados para substituir estruturas de repetição](https://rubystyle.guide/#no-for-loops) como o `for`. Outro uso bastante comum é em linguagens específicas de domínio (como as rotas)