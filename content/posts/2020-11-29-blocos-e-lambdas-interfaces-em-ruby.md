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

Os blocos são geralmente usados para declarar uma transformação ou procedimentos para serem passados executados em coleções ou em objetos. Além disso, [podem ser usados para substituir estruturas de repetição](https://rubystyle.guide/#no-for-loops) como o `for`. Outro uso bastante comum é em linguagens específicas de domínio (como as [rotas do Rails](https://guides.rubyonrails.org/routing.html)).

1. [Métodos especiais](https://tomascco.dev/posts/interfaces-no-ruby)
2. [Assinaturas de métodos](https://tomascco.dev/posts/assinatura-de-metodos)
3. [Módulos, Classes e Constantes](https://tomascco.dev/posts/modulos-classes-e-constantes) (esse post)
4. [Blocos e Lambdas](https://tomascco.dev/posts/blocos-e-lambdas) (esse post)
5. Duck typing (em breve...)

## Passando blocos para métodos

Somente alguns métodos em Ruby aceitam blocos. Alguns desses blocos aceitam argumentos. Como descobrir quais métodos permitem a passagem de blocos e quais parâmetros podem ser acessados dentro dele?

A documentação do Ruby e também das bibliotecas nesse caso é essencial para entender isso.

Utilizando o exemplo do método `Array#sort`, podemos pesquisar sua referência em <https://ruby-doc.org/core-2.7.2/Array.html#method-i-sort>. Lá podemos ver que o método possui a seguinte assinatura:

> sort → new_ary
>
> sort {|a, b| block} → new_ary

Vemos que existem duas sintaxes possíveis para esse método, no caso estamos interessados pela segunda. Podemos observar que `sort` pode receber um bloco com dois argumentos. Se lermos a descrição do método no link acima, vemos que o bloco é a função de comparação a ser usada para ordenar os elementos da Array, por isso são aceitos dois argumentos, eles são representações de elementos da Array. Um exemplo seria o seguinte:

```ruby
ary = [5, 9, 10, 2, 4, 3, 7]

# recomendado para blocos de
# uma linha
ary.sort { |a, b| a <=> b }

# para blocos multilinha
ary do |a, b|
  # ...
  a <=> b
end

# pouco utilizado
# prefira o do...end
ary.sort { |a, b|
  # ...
  a <=> b
}
```

Também é possível passar um objeto da classe [Proc](https://ruby-doc.org/core-2.7.2/Proc.html) para um método que aceita blocos, utilizando `&` antes do nome da variável, para sinalizar que aquela variável contém o bloco a ser chamado pelo método e não como argumento:

```ruby
bloco = Proc.new do |a, b|
  puts 'olá'
  a <=> b
end

ary.sort(bloco)
# ArgumentError (wrong number of arguments (given 1, expected 0))
# tomamos um erro pois o bloco
# é considerado um argumento

ary.sort(&bloco)
# olá
# olá
# ...
# => [2, 3, 4, 5, 7, 9, 10]
```

## Criando métodos com blocos

Métodos que aceitam blocos são aqueles que recebem **um** argumento com `&` antes de seu nome (também deve ser o último da lista de argumentos) ou que utiliza a palavra-chave `yield`.

### `&block`

Esse argumento, na maioria das vezes, recebe o nome de `block` por convenção. Ele é utilizado quando se pretende manipular o bloco de alguma maneira (ele é uma instância de [Proc](https://ruby-doc.org/core-2.7.2/Proc.html)) ou quando se quer enviar o bloco para outro método (delegar). Um exemplo disso seria o exemplo (modificado) da postagem passada:

```ruby
class Points
  attr_reader :collection
  
  def initialize(collection)
    @collection = collection
  end

  def each(&block)
    @collection.each(&block)
  end
end
```

Nele podemos ver que o argumento de bloco `block` é repassado para o método each de `@collection` (uma Array). Note que `&` somente denota que `block` é um argumento de bloco. Como foi dito antes, `block` pode ser manipulado a vontade dentro do método:

```ruby
def method_with_block(&block)
  p block.class
  p block.parameters
  block.call(5)
end

method_with_block do |a, b|
  [a, b]
end
# Proc
# [[[:opt, :a], [:opt, :b]]
# => [5, nil]
```

> Note que só foi passado um argumento ao método `call`, porém o bloco foi chamado com dois argumentos. Quando isso acontece, como podemos ver, os argumentos adicionais tomam o valor `nil`.
>
> Note também que o valor retornado ao se chamar um bloco é o valor de sua última expressão.

Veja que nesse método, além de chamar o bloco, também são impressas informações sobre o bloco em si.

### `yield`

Significando *conceder; dar o controle* em inglês, a palavra `yield` "concede" o fluxo de execução para o bloco dado pelo usuário ao invocar o método e retorna o resultado da última expressão para o método. Para entender melhor veja os exemplos abaixo: 

```ruby
# aqui damos yield no objeto passado
# pelo usuário, logo vemos que o 
# argumento do método virará o 
# argumento do bloco
def yielder(obj)
  yield(obj)
end

yielder('Hello') do |str|
  str << ' World'
end

# o yield resulta em um
# valor que pode ser manipulado
# ou atribuido a uma variável
def sum_ten_with_block
  number = yield
  
  number + 10
end
# ou
def sum_ten_with_block
  yield + 10
end

# como o resultado da ultima
# expressão do bloco é 5
# yield vai retornar 5
sum_ten_with_block { 5 }
# => 15
```

### `block_given?`

Ao usar o `yield` podemos encontrar dificuldades, pois não temos como verificar se um bloco foi passado ou não para nosso método, já que usando `&block` poderíamos simplesmente perguntar `block.nil?`. Para resolver esse problema, o módulo `Kernel` nos oferece a função `block_given?`.

```ruby
def yielder(obj)
  return yield(obj) if block_given?
  
  'Nenhum bloco fornecido'
end

yielder(6)
# => "Nenhum bloco fornecido"

yielder(6) do |n|
  n + 14
end
# => 20
```

> Observe a expressão `yield if block_given?`. Ela só executa o bloco se for passado algum para o método. Além disso, na mesma linha, foi utilizada e estratégia de *[guard clause](https://campuscode.com.br/conteudos/guard-clause-em-ruby)* para evitar o uso de um if/else, deixando o código mais legível

## Lambdas

São um tipo especial de `Proc` mais "rigoroso". Sua principal diferença para os *procs* é a checagem estrita dos parâmatros passados, levantando `ArgumentError` no caso de argumentos a mais ou a menos. Fora isso, há também outras diferenças importantes, que podem ser conferidas [nesse tópico](https://ruby-doc.org/core-2.7.2/Proc.html#class-Proc-label-Lambda+and+non-lambda+semantics) da documentação.

```ruby
# declarando lambdas
lambda_func = lambda do |a, b|
  [a, b]
end
# ou (sintaxe literal)
lambda_func = ->(a, b) do
  [a, b]
end

proc_func = proc { |a, b| [a, b] }
end

lambda_func.call(4)
# ArgumentError (wrong number of arguments (given 1, expected 2))

proc_func.call(4)
# => [4, nil]

# outras maneiras de chamar
# lambdas ou procs:
lambda_func.(4, 5)
# => [4, 5]

proc_func[7, 8]
# => [7, 8]
```