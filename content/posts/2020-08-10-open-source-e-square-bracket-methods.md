---
template: post
title: Open Source e comportamento
slug: open-source-e-comportamento
draft: false
date: 2020-08-09T23:36:49.752Z
description: Nesse artigo, venho relatar sobre minha primeira contruibuição para
  um projeto público e entrar em uma discussão sobre square bracket methods
category: Ruby
tags:
  - Ruby
---
## Open source

Essa semana eu fiz uma contribuição em uma gem open-source, a u-case, que é feita pelo Rodrigo Serradura, do grupo do Ruby Brasil (@serradura). Ele tem um grupo da gem no telegram e nesse grupo ele pede feedbacks. Procurando ajudar iniciantes ele abriu um issue e pediu para alguém fazer no grupo do telegram. Eu topei ajudar e implementei a feature que ele documentou. Aqui o [PR](https://github.com/serradura/u-case/pull/60).

Foi uma experiência muito boa, pois apesar de simples, tive mais uma ideia do processo de trabalhar com projetos de software, implementando uma feature nova. Primeiro fiz os testes, depois a implementação, tive certeza que os testes estavam passando e depois atualizei a documentação. Após isso o Serradura fez o Review do código comigo no telegram. Apesar de ele estar viajando e não puder me dizer as últimas alterações que ele quer antes de dar merge, daqui a pouco vou ter minha primeira contribuição open source mergeada!

## A implementação

A implementação, foi bem simples, mas foi um exercício muito bom de Ruby, de orientação a objetos.

O que fiz, como descrito na [issue](https://github.com/serradura/u-case/issues/59), foi implementar 3 métodos na classe `Micro::Case::Result`, para fazer ela ficar mais parecida como uma hash, apesar de não ser uma. Você poderia me perguntar qual a necessidade de reimplementar os métodos da classe `Hash` em outra classe, por que não simplesmente usar a classe `Hash`? Na minha visão, essa é uma das belezas da programação orientada a objetos e uma prática muito boa: utilizar interfaces que já existem (como a Hash) e extender sua funcionalidade com novos comportamentos (métodos), que podem ser muito úteis.

## Novos comportamentos

No caso da gem `u-case`, `Micro::Case::Result` é o resultado de um processo (`Micro::Case`). Um dos seus comportamentos adicionais é o seguinte: se `result` for uma instância de `Micro::Case::Result`, você pode utilizar: `result.success?` para saber se houve sucesso no processo. Se sim, pode ser utilizado `result[:key]` para acessar um dos dados do resultado, como se fosse uma hash normal. Esse foi um pequeno exemplo, pois essa classe tem vários outros comportamentos e métodos interessantes, além desse.

Outra classe famosa que faz "quack" como uma hash é a `HashWithIndifferentAccess`, da gem `ActiveSupport`. Apesar de parecer uma hash, seu comportamento extra é que não há diferença entre `"key"` e `:key` na hora de acessar uma chave da Hash. Exemplo:

```ruby
require "active_support/core_ext/hash/indifferent_access"

hash = {}
hash[:key] = 5
hash["key"] = 1

hash[:key]
# => 5

hash["key"]
# => 1

hash_mod = HashWithIndifferentAccess.new
hash_mod["key"] = 8

hash_mod[:key]
# => 8

```

Logo, vemos que na `HashWithIndifferentAccess` não há "diferença no acesso" seja usando símbolo ou string para definir a chave. Curiosidade: também pode ser usado o método `Hash#with_indifferent_access` para transformar uma Hash normal em um objeto da classe `HashWithIndifferentAccess`, lembrando que essa classe só está disponível com a gem `ActiveSupport`, que faz parte do Rails, mas pode ser usado sem ele.

```ruby
require "active_support/core_ext/hash/indifferent_access"

hash = {comida: "arroz", bebida: "suco"}.with_indifferent_access

hash.class
# => HashWithIndifferentAccess

hash[:comida]
# => "arroz"
hash["comida"]
# => "arroz"
```
