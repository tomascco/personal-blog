---
template: post
title: "Assinaturas de métodos: Interfaces no Ruby"
slug: assinatura-de-metodos
draft: true
date: 2020-11-10T17:52:03.281Z
description: Como as assinaturas de métodos podem nos ajudar a definir interfaces?
category: Ruby
tags:
  - Ruby
  - Interfaces
---
Com a [chegada iminente do Ruby 3](https://www.ruby-lang.org/pt/news/2020/09/25/ruby-3-0-0-preview1-released/) no natal e a sua promessa de ser [3 vezes mais rápido que o Ruby 2](https://www.youtube.com/watch?v=LE0g2TUsJ4U&t=3248), temos várias ***[breaking changes](https://en.wiktionary.org/wiki/breaking_change)***, isto é, mudanças que podem fazer seu código parar de funcionar!

Uma das mudanças que tem dado mais dor de cabeça nessa transição é a da separação de argumentos posicionais e argumentos *keyword* (palavras-chave).

Aproveitando essa mudança, hoje vamos falar de assinatura de métodos e como elas são importantíssimas para a criação de interfaces.

1. [Métodos especiais](https://tomascco.dev/posts/interfaces-no-ruby)
2. Mixins (em breve...)
3. Duck typing (em breve...)
4. Blocos (em breve...)
5. [Assinaturas de métodos](https://tomascco.dev/posts/assinatura-de-metodos) (esse post)

## O que são assinaturas de métodos e qual sua importância?

Segundo a [Wikipedia](https://en.wikipedia.org/wiki/Function_prototype) (minha tradução), assinaturas de métodos, protótipos de função ou interface de função é:

> "A declaração de uma função que especifica seu nome, e assinatura de tipo ([aridade](https://pt.wikipedia.org/wiki/Aridade), tipos de dados, argumentos e tipos de retorno)."

Apesar de essa definição ser mais geral e nós não termos alguns desses elementos nos métodos em Ruby, ela captura bem a ideia a seguinte ideia, também do mesmo artigo:

> Enquanto o corpo de uma função define **como** ela faz o que faz, sua assinatura especifica sua **interface**, ou seja, quais dados entram e quais dados saem.

Sendo um dos blocos mais essenciais para qualquer linguagem de programação, é muito fácil refletir sobre o que interfaces mal planejadas podem ocasionar. 

Quantas vezes você já passou os argumentos na ordem errada? Quantas vezes você já precisou ir até a definição de uma função porque não estava nada claro o que deveria ser passada em cada argumento? Você já se estressou com algum retorno inconsistente de um método?

Concluida essa introdução, vamos tratar do que é possível fazer um Ruby.

### Argumentos posicionais

No Ruby, argumentos posicionais são aqueles que declarados "normalmente" por nós, são identificados pelo nome no contexto do método e precisam ser passados em ordem. Exemplo:

```ruby
def metodo(arg1, arg2)
  puts "Esse é arg1: #{arg1}"
  puts "Esse é arg2: #{arg2}"
end
```

Nesse caso, podemos fazer os seguintes testes:

```ruby
a = 1
b = 2
metodo(a, b)
# Esse é arg1: 1
# Esse é arg2: 2
# => nil

metodo(b, a)
# Esse é arg1: 2
# Esse é arg2: 1
# => nil
# Vemos que trocar a ordem dos argumentos na chamada
# troca os valores de arg1 e arg2.

metodo(a)
# ArgumentError (wrong number of arguments (given 1, expected 2))
# Passar o número errado de argumentos levanta uma exceção.
```

#### Valores padrão (argumentos opcionais)

Apesar de não ser possível declarar o mesmo método com diferentes listas de argumentos (sobrecarga), como no Java, no Ruby podemos definir valores padrão para alguns argumentos, tornando esses parâmetros opcionais. Para isso, podemos observar o seguinte exemplo:

```ruby
def metodo(arg1 = 1, arg2 = 2, arg3)
  p arg1, arg2, arg3
end

metodo()
# ArgumentError (wrong number of arguments (given 0, expected 1..3))
# Nosso método aceita de 1 a 3 argumentos.

metodo(4)
# 1
# 2
# 4
# Vemos que os valores padrão foram utilizados.

metodo(5, 8)
# 5
# 2
# 8
# Podemos ver que nesse caso, como nosso método aceita de 1 a 3
# argumentos, a primeira posição foi para arg1
# enquanto a segunda foi para arg3.
```

Os valores