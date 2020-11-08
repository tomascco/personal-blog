---
template: post
title: "Métodos Especiais: Interfaces no Ruby"
slug: interfaces-no-ruby
draft: false
date: 2020-11-05T18:02:08.454Z
description: Como implementar interfaces no Ruby, já que ele não apresenta uma
  sintaxe própria como o Java?
category: Ruby
tags:
  - Ruby
  - Interfaces
---
Continuando do [post anterior](https://tomascco.dev/posts/open-source-e-comportamento), que falou sobre classes que usam o método `#[]`, como a `Hash`, iremos aprender como programar para interfaces no Ruby.

## Mas o que são interfaces?

O termo interface aqui, vai ser utilizado no seu sentido mais geral, que na minha definição é:

> Um contrato entre dois ou mais componentes (blocos de código) que é capaz de comunicar quais funcionalidades estão disponíveis naquele componente, promovendo segurança e abstraindo a implementação.

Logo, as funcionalidades apresentadas a seguir, de alguma forma, definem maneiras específicas de realizar certas ações e caso não implementadas, levantam erros.

1. [Métodos especiais](https://tomascco.dev/posts/interfaces-no-ruby) (esse post)
2. Mixins (em breve...)
3. Duck typing (em breve...)
4. Blocos (em breve...)
5. *Keyword arguments* (em breve...)

### Métodos *syntactic sugar*

Assim como o Python com os *[Special Methods](https://docs.python.org/3/reference/datamodel.html#special-method-names)* e a Lua com as *[Metatables](https://www.lua.org/pil/13.html)*, o Ruby também tem uma estratégia para sobrescrever operações básicas como a soma, subtração e acesso por índice (`object[index]` por exemplo).

Porém, diferente das linguagens citadas acima, podemos dizer que a abordagem do Ruby é mais "natural" e intuitiva, pois quase tudo são objetos:

```ruby
1.class # => Integer
```

Outra consideração é que o Ruby nos deixa usar quase qualquer coisa como caracteres válidos para identificadores:

```ruby
☁️ = "cloud"
def️ ➡️(arg)
  arg
end

➡️ ☁️ # => "cloud"
```

Logo, nada mais justo que o jeito de implementar essas operações seja definindo métodos. Depois desses exemplos, podemos começar a estudar os "métodos especiais" do Ruby!

```ruby
class MyInt
  attr_reader :int

  def initialize(int)
    @int = int
  end

  def +(other)
    MyInt.new(self.int + other.int) # o self pode ser omitido nesse caso?
  end
end
```

Até agora não fizemos nada de diferente do que estamos acostumados, com exceção da definição do método `+`, que apesar de ter um nome diferente, aceita um argumento chamado `other`. Nesse método, retornamos uma nova instância de `MyInt`, com o atributo `int` sendo a soma do própria instância com o `int` de `other`. Isso parece uma soma 🤔. Vamos testar!

```ruby
a = MyInt.new(5)
b = MyInt.new(7)
a.+(b) # => <MyInt @int=12>

# Funciona! Que tal omitirmos os parênteses?
a.+ b # => <MyInt @int=12>

# Bem, acho que deu pra entender onde vamos chegar né?
a + b # => <MyInt @int=12>
```

A última sentença normalmente daria um erro de sintaxe, pois estamos chamando um método sem usar ponto e separando com espaço, porém quando interpretador vê a sintaxe acima, ele "substitui" `a + b` por `a.+(b)`! São duas maneiras de escrever a mesma coisa, porém uma mais simples que a outra. No geral, chamamos isso de `syntactic sugar`, pois facilita a compreensão e escrita de programas!

E as classes que não foram criadas por nós? Elas também apresentam esse comportamento? Vamos testar.

```ruby
1.+(4) # => 5
'Meu nome é '.+ 'Tomás' # => "Meu nome é Tomás"
[1, 'oi', {comida: 'ovo'}].+ [20] # => [1, "oi", {:comida=>"ovo"}, 20]
```

Logo, podemos perceber que somar na verdade significa invocar o método `+(other)` do primeiro operando, utilizando o segundo operando como o argumento `other`! Isso significa que agora nossas classes e módulos podem implementar a interface **Soma**!

Além da soma, podemos sobrescrever vários operadores, como `+`, `-`, `/`, `*`, `**`, `<<`, `>>`, `>` `<`, `>=`, `<=`, `!=`, `==`, entre outros. É muito poder! Aqui vai um exemplo divertido para você testar.

```ruby
module BrokenOperations
  def self.+(*)
    42
  end
  def self.!=(*)
    'Você sabe o que a sintaxe def method(*) faz?'
  end
  def self.>=(*)
    'Ela faz com que qualquer tipo de argumento passado seja ignorado!'
  end
end

BrokenOperations.+('OwO')
# => 42
BrokenOperations.!= 50
# => "Você sabe o que a sintaxe def method(*) faz?"
BrokenOperations >= nil
# => "Ela faz com que qualquer tipo de argumento passado seja ignorado!"
```

### Implementando Acesso por indexação

Algumas Classes como `Hash` e `Array` implementam a interface de acesso por índice:

```ruby
array = [1, 3, 7]
array[0] # => 1
# Agora que já vimos a parte anterior você consegue entender
# a implicação que a linha abaixo tem?
array.[](2) # => 7

# E as hashes?
hash = {comida: 'bolo', "idade" => 21, 18 => 81}
hash.[](:comida) # => "bolo"
hash.[] 'idade' # => 21
hash[18] # => 81
```

Sim, é isso mesmo que você está pensando. As classes `Array` e `Hash` definem o método `[]`! Note também que o argumento que `[]` recebe pode ser de vários tipos diferentes! Para exemplificar, vamos criar um tipo especial de Array que pode ser acessado com strings:

```ruby
class MyArray
  def initialize(array)
    @array = array
  end

  def [](index)
    int_index = index.is_a?(Integer) ? index : index.to_i
    @array[int_index]
  end
end
```

Ok. Veja que nesse exemplo implementamos `[]` recebendo o argumento `index`, que é convertido para inteiro se não for uma instância de `Integer` e atribuido a `int_index`. Após isso, utilizamos o bom e velho `[]` das Arrays que estamos acostumados a utilizar, porém com o `int_index` como argumento.

> Note que no fim das contas, nossa classe somente "trata" (converte para inteiro) o argumento `index` antes de o passar para a o método `[]` de `Array`. Esse padrão é extremamente poderoso!

Vamos aos testes:

```ruby
array = MyArray.new([0,1,2,3,4])
# => <MyArray @array=[0, 1, 2, 3, 4]>

array["0"]
# => 0
array["2"]
# => 2

array[1.9]
# => 1
array[7/3r] # 7/3r é um racional literal e
# => 2      # representa exatamente sete terços ou 2,333...
```

> Mas pera, que dois últimos exemplos foram esses?

Quando fizemos a implementação da nossa classe `MyArray` com o objetivo de acessar arrays utilizando strings, nós dependemos do método `to_i`, que é implementado na classe `String`, porém ele também é implementado em outras classes. Logo, toda classe que implemente o método `#to_i` poderá ser utilizado pela nossa implementação como índice! Descobrimos mais um tipo "interface" que será abordada adiante 😏

Além do uso "convencional", sobrescrever operadores em Ruby também pode deixar nosso código mais expressivo, abrindo mais possibilidades de expressar intenção com o código, além de facilitar a vida de nós, programadores. Veja o exemplo a seguir, que se aproveita da interface `[]` para obter os benefícios acima.

```ruby
class MyArray
  def self.[](*array)
    new(array)
  end
end
```

> Note também a sintaxe utilizada para declarar o argumento de `[]`, vamos falar disso mais tarde!

Com esse *[monkey patch](https://pt.stackoverflow.com/questions/285190/o-que-%C3%A9-monkey-patch)*, agora podemos instanciar objetos `MyArray` da seguinte forma:

```ruby
array = MyArray[0,1,2,3,4]
# => <MyArray @array=[0, 1, 2, 3, 4]>
```

Muito mais prático e expressivo! Utilizamos `[]` como método de classe para instanciar uma nova `MyArray`.

### *Getters* e *Setters*

Presentes em muitas linguagens orientadas a objetos, nossos velhos amigos também estão presentes em Ruby e podem servir de interface.

Vamos começar com os *getters*. Sua implementação é trivial e não depende de nenhum método especial:

```ruby
class Person
  def initialize(name, age)
    @name = name
    @age = age
  end

  # getters
  def name
    @name
  end
  
  def age
    @age
  end
end

me = Person.new('Tomás', 21)
me.name # => "Tomás"
me.age # => 21
```

Como você pode ter imaginado, Getters em Ruby são métodos com o mesmo nome de seus atributos e só retornam o atributo. É fácil de ver que nem todo método é um getter.

As coisas ficam realmente interessantes com os *setters* e a constatação que eles são apenas um uso específico de sobrescrita de operadores! Veja o exemplo:

```ruby
class Person
  def initialize(name, age)
    @name = name
    @age = age
  end

  # getters
  def name
    @name
  end
  
  def age
    @age
  end
  
  # setters
  def name=(name)
    @name = name
  end
  
  def age=(age)
    @age = age
  end
end

me = Person.new('Tomás', 21)
me.name # => "Tomás"

me.name=('Gustavo') 
# ou
me.name= 'Gustavo'
# ou
me.name = 'Gustavo'

me.name # => "Gustavo"
```

Logo percebemos que na verdade, métodos *setters* são a ponta do iceberg de um fenômeno maior, o mesmo que vimos até agora, métodos com *syntactic sugar*! Qualquer método com o nome do tipo `algum_nome=(arg)` pode ser reescrito como `algum_nome = arg` e não! Um método desse tipo não precisa corresponder a um atributo do objeto 😎

```ruby
class Person
  def favorite_food=(name)
    puts "Minha comida favorita agora é #{name}"
  end
end

person = Person.new

person.favorite_food = 'Macarrão'
# Minha comida favorita agora é Macarrão
# => nil
```

Apesar de ser difícil encontrar um uso prático para uma atribuição que não atribua nada, é sim possível utilizar essa sintaxe desse jeito. Outro exemplo importante é o seguinte:

> Note que não é uma boa prática implementar *getters* e *setters* na mão, pois além de já existirem os métodos *[attr](https://ruby-doc.org/core-2.7.2/Module.html#method-i-attr_accessor)* para não poluir seu código com linhas quase idêncitas, escrever na marra é [menos performático](https://github.com/JuanitoFatas/fast-ruby#attr_accessor-vs-getter-and-setter-code).

```ruby
class MyArray
  def self.[](*array)
    new(array)
  end

  def initialize(array)
    @array = array
  end

  def [](index)
    int_index = index.is_a?(Integer) ? index : index.to_i
    @array[int_index]
  end
 
  def []=(index, value) # novo método
    int_index = index.is_a?(Integer) ? index : index.to_i
    @array[int_index] = value
  end
end
```

> Note que há linhas idênticas, você consegue melhorar esse código?

Sim, é isso que eu quero dizer quando digo que o Ruby é intuitivo. Você consegue chutar o que o nosso novo método `[]=` faz? Veja:

```ruby
array = MyArray[0,1,2,3,4]
array["1"] # => 1
array.[]=("1", 100)
# ou
array.[]= "1", 100
# ou
array["1"] = 100

array["1"] # => 100

array # => <MyArray @array=[0, 100, 2, 3, 4]>
```

Agora podemos modificar o valor da nossa `MyArray`.

## Conclusão

Nesse post, vimos que podemos reimplementar uma boa parte dos operadores da linguagem, de maneira a criar uma interface comum para classes personalizadas, que incluem novas funcionalidades. Como fizemos no exemplo acima, toda vez que quisermos implementar uma noção de busca e recuperação de dados, podemos implementar os métodos `#[]` e `#[]=`, assim, temos uma interface familiar (já usada por Arrays e Hashes) para nossa classe. Outro exemplo seriam classes com noções de soma, que poderiam implementar o método `+` para fornecer uma interface bem conhecida de qualquer pessoa estudante de matemática!

Para finalizar, tenho que destacar que esses recursos são muito úteis na construção de bibliotecas e frameworks, porém pouco úteis na programação do dia-a-dia, em que somente **dependemos das interfaces** disponibilizadas e **não precisamos conhecer nenhum detalhe de implementação** desses softwares para utiliza-los. Porém, acredito que a partir de hoje você estará um pouco mais apto a criar suas próprias abstrações, bibliotecas e frameworks!