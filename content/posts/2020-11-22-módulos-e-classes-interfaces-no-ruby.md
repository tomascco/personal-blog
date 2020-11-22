---
template: post
title: "Módulos, Classes e Constantes: Interfaces no Ruby"
slug: modulos-classes-e-constantes
draft: true
date: 2020-11-22T13:32:54.983Z
description: Quais são as diferenças entre Módulos e Classes? Quando usar um e
  quando usar outro? Qual é a relação entre esses dois e Constantes?
category: Ruby
tags:
  - ruby
  - modulos
  - classes
  - constantes
---
Para me aprofundar no estudo de Ruby e dar uma folga ao Rails, resolvi criar uma [gem](https://github.com/tomascco/pokecli) bem simples. Nessa atividade me deparei com vários aprendizados, pois querendo ou não o Rails toma muitas decisões por você, além de sobrescrever vários comportamentos padrões do Ruby (como o [autoloading de código](https://guides.rubyonrails.org/autoloading_and_reloading_constants.html)).

Entre essas dificuldades, posso destacar uma que tem tudo a ver com interfaces e com Ruby: eu não sabia como era estruturada uma gem e nem como organizar meu código no geral. Quando usar classes, quando usar módulos, quais nomes de variáveis, módulos, *namespaces* e classes utilizar.

Acredito que para quem está começando essas dificuldades são extremamente comuns (como foram para mim) e se relacionam muito com a essência da própria Engenharia de Software, sendo citadas em quase todos os conteúdos sobre o assunto.

Nesse post, como sempre, não pretendo ditar como e quando cada ferramente deve ser utilizada, pois não me sinto capacitado para isso, além de [não existir bala de prata](https://en.wikipedia.org/wiki/No_Silver_Bullet) que resolva todas situações; cada caso é um caso!

Logo, podemos começar a estudar quais ferramentas o Ruby oferece para a organização do código de maneira geral.

1. [Métodos especiais](https://tomascco.dev/posts/interfaces-no-ruby)
2. [Módulos, Classes e Constantes](https://tomascco.dev/posts/modulos-classes-e-constantes) (esse post)
3. Duck typing (em breve...)
4. Blocos (em breve...)
5. [Assinaturas de métodos](https://tomascco.dev/posts/assinatura-de-metodos)

## Módulos

Definidos pela [documentação](https://ruby-doc.org/core-2.7.2/Module.html) simplesmente como "coleções de métodos e constantes", os módulos servem para agrupar código, que também segundo a documentação, pode servir de *namespace* ou como mixin (que falaremos mais adiante).

```ruby
# exemplo de módulo
module Sounds
  DOG = 'bark'
  
  def self.play(sound)
    puts sound
  end
  
  def cat
    'purrrrrrr'
  end
end
```

### Módulos como *namespace*

*[Namespaces](https://en.wikipedia.org/wiki/Namespace#In_programming_languages)* são contextos feitos para aumentar o nível de organização e evitar conflitos de nomes, de forma semelhante a pastas e arquivos de computador:

```ruby
X = 42

module Different
  X = 1
end

X
# => 42

Different::X
# => 1
```

Outro detalhe é que os métodos definidos com `self` ou com a sintaxe `class << self; end` são considerados métodos de classe (ou de módulo) e podem ser chamados diretamente:

```ruby
# módulos podem ser "reabertos"
# para extender suas funcionalidades
module Different
  def self.sum_x(other)
    X + other
  end
  
  class << self
    def times_x(other)
      X * other
    end
  end
end

# lembre do valor de X
# do exemplo passado
Different.sum_x(4)
# => 5

Different.times_x(4)
# => 4
```

Módulos também podem ser aninhados:

```ruby
module A
  module B
    module C
      D = 'nested'
      
      def self.hi
        puts 'hi from C'
      end
    end
  end
end

A::B::C::D
# => "nested"

A::B::C.hi
# => "hi from C"
```

### *Mixins*

Apesar da linguagem Ruby não apresentar herança múltipla, é possível extender classes para além de sua herança com essa funcionalidade, em que os todos os métodos de instância e constantes de um módulo são incluídas em uma classe:

```ruby
module Playable
  SUPPORTED_FORMATS = %w[mp3 flac aac]

  def play
    sound
  end
end

class Dog
  include Playable

  def sound
    'bark'
  end
end

dog = Dog.new
dog.play
# => "bark"

Dog::SUPPORTED_FORMATS
# => ["mp3", "flac", "aac"]
```

Nesse exemplo, quando o *mixin* `Playable` é incluído em `Dog`, os métodos de instância e constantes do módulo (no caso `play` e `SUPPORTED_FORMATS`) são incluídos na classe `Dog` e podem ser usadas como no exemplo acima.

> Note que acabamos de criar mais um tipo de interface, pois o módulo `Playable` espera que a classe em que foi incluída defina o método `sound`. Se esse método não for definido, `play` falhará.

A própria biblioteca padrão do Ruby se utiliza de *mixins*, que são extramemente úteis, o [Enumerable](https://ruby-doc.org/core-2.7.2/Enumerable.html) e o [Comparable](https://ruby-doc.org/core-2.7.2/Comparable.html), que definem vários métodos, porém dependem da implementação dos métodos `#each` e `#<=>` para funcionarem.

## Classes

Apesar de já termos usado classes nos exemplos anteriores, sempre é bom começarmos do começo.

[Classes](https://pt.wikipedia.org/wiki/Classe_(programa%C3%A7%C3%A3o)) são o molde para a criação de objetos e definem propriedades e comportamentos. Porém, em Ruby, classes também são objetos (da classe `Class`) e tem como superclasse a classe `Module`, que é a classe dos módulos que estudamos acima. E sim, isso é extremamante confuso 🤔

```ruby
class Animal
end

Animal.class
# => Class

Class.superclass
# => Module

Module.class
# => Class
```

Porém o intuito é mostrar que as classes em Ruby são superclasse, ou seja, herdam de `Module`. Isso significa que todos os métodos de instância de [Module](https://ruby-doc.org/core-2.7.2/Module.html#method-c-used_modules) podem ser usados em classes. Um exemplo disso são os métodos `attr_accessor`, `include`, `private`, entre outros.

> Note que apesar disso, classes não podem ser incluídas como *mixins*.

Da mesma maneira que módulos, classes podem ser *namespace*:

```ruby
class Mammals
  class Dog
    attr_reader :name
    
    def initialize(name:)
      @name = name
    end
  end
  
  class Cat
    attr_reader :name
    
    def initialize(name:)
      @name = name
    end
  end
  
  attr_reader :collection
  
  def initialize(collection)
    @collection = collection
  end
end

bud = Mammals::Dog.new name: 'Bud'
# => <Mammals::Dog @name="Bud">
meowth = Mammals::Cat.new name: 'Meowth'
# => <Mammals::Cat @name="Meowth">

my_animals = Mammals.new([bud, meowth])
# => <Mammals @collection=[<Mammals::Dog @name="Bud">, <Mammals::Cat @name="Meowth">]>
```

Também podemos misturar classes e módulos sem nenhum problema:

```ruby
class A
  module B
    class C
      def initialize
        'hi'
      end
    end
  end
end

A::B::C.new
# => "hi"
```

Outra diferença entre classes e módulos é que a classe também herda métodos e constantes de sua superclasse:

```ruby
class A
  Z = 1

  def z
    Z
  end
end

class B < A
end

b = B.new
b.z
# => 1
```

Além disso, outros detalhes da Orientação a Objetos também se aplicam, como a sobrescrita de métodos e a utilização da palavra reservado `super`.

## Constantes

Apesar de não parecer muito relacionado com esses dois conceitos que acabamos de ver, entender constantes em Ruby é essencial para utilizar classes e módulos de maneira efetiva, além de nos ensinar um pouco sobre o funcionamento interno da linguagem.

Uma das justificativas para esse ponto é que classes e módulos não são nada mais que instâncias de `Class` e `Module` atribuidas a constantes, veja:

```ruby
class A
end
# é exatamente a
# mesma coisa de:
A = Class.new

# ou

module B
end
# ==
B = Module.new
```

Nas duas formas a propriedade `#name` é atribuída com o nome da constante com que foi associada e nunca muda:

```ruby
String.name
# => "String"

# porém

MyString = String

MyString.name
# => "String"
```

Outra coisa para lembrarmos é que constantes são identificadores que não podem ser reatribuídos, porém **podem ser modificados**.

```ruby
NUMBERS = [1, 2, 3, 4]
NUMBERS.delete_at(0)

NUMBERS
# => [2, 3, 4]

# constantes podem guardar
# qualquer tipo de objeto.
LAMBDA = ->x,y {x + y}
# => <Proc (lambda)>
STRING = 'olá'
# => "olá"
```

Por último, vale lembrar que as constantes são armazenadas e pertencem a módulos (lembrando que classes também são módulos!)

### Contexto e resolução de constantes

Como virmos anteriormente, módulos e classes alteram o contexto de execução ao definirem *namespaces*, logo é natural que passemos a nos preocupar com quais constantes estão acessíveis no contexto atual e quais não estão, pois não queremos introduzir erros e bugs nas nossas aplicações.

Os exemplos a seguir mostra como apesar de simples, podemos facilmente levar erros na cara ao lidar com constantes:

```ruby
Z = 1

module A
  Z = 100
  module B
    p Z # escreve 100
  end
end

module C
  X = 3
  module D
    p X # escreve 3
  end
end
# porém
module C::D
  p X # dá erro
end
```

#### *Nesting*

Sendo mais ou menos o que chamamos de contexto, `Module.nesting` é um método que nos informa em qual contexto estamos e portanto, quais constantes estão disponíveis.

```ruby
module A
  Z = 20
  module B
    Module.nesting # => [A::B, A]
    p Z # => 20
  end
end

module A::B
  Module.nesting # => [A::B]
  p Z # dá erro pois A não
end   # está no Module.nesting
```

Com isso podemos concluir que apesar de estarmos em um contexto bastante aninhado, ainda assim podemos acessar as constantes de outros contextos, desde que o aninhamento esteja explícito:

```ruby
module A
  X = 19
  module B
    module C
      module D
      end
    end
  end
end

module A::B
  module C::D
    Module.nesting
    # => [A::B::C::D, A::B]
    p X # dá erro, pois A 
  end   # não está no nesting
end

module A
  module B::C::D
    Module.nesting
    # => [A::B::C::D, A]
    p X # => 19
  end
end
```

Vemos que não precisamos abrir todos os módulos, um de cada vez, para não levarmos erros, só precisamos abrir o módulo em que a constante está definida.

#### Constantes relativas

São constantes chamadas sem nenhum prefixo, como as do exemplo anterior.

Sua resolução, como vimos (em parte) se dá da seguinte maneira:

1. Procura-se a constante nos elementos de `Module.nesting`;
2. Procura-se a constante nas sua superclasse e outros ancestrais (`self.ancestors`);
3. Se não encontrada em nenhum dos passos, chama-se o método `const_missing` (similar ao `method_missing`).

Logo, podemos ver como a herança e o contexto dão acesso às constantes.

#### Constantes qualificadas

São aquelas que tem uma constante relativa na frente, como `A::X` do exemplo anterior, em que `A` é uma referência relativa e `X` uma constante qualificada.

Sua resolução inclui:

1. Procurar `A` (referência relativa) com no algoritmo anterior;
2. Procurar `X` (referência qualificada) nos ancestrais de `A` (referência relativa);
3. Se não encontrada, chamar o método `const_missing` de `A`.

Exemplo (considerando o exemplo anterior):

```ruby
module E
  Z = 1
  module F
    Z = 2

    Z # => 2
    E::Z # => 1
  end
end
```

#### Contexto global e referências absolutas

No exemplo anterior para referenciar `Z` do módulo `F`, utilizamos uma referência relativa, para referênciar `Z` do módulo `E`, usamos `E::Z`. Porém, e se quiséssemos acessar uma constante `Z` definida no escopo global?

Para isso, podemos utilizar `::` antes do nome da constante. Logo, reabrindo os módulos do exemplo anterior:

```ruby
Z = 0

module E
  module F
    Z # => 2
    E::Z # => 1
    ::Z # => 0
  end
end
```

## Exemplos e casos de uso

Como já vimos bastante coisa até agora, vamos ver alguns exemplos práticos.

### Funções utilitárias

É bem provável que você já tenha se deparado com blocos de código que não dependem do estado ou da instância de nenhum objeto, mesmo assim se encontram em classes. Isso pode ser considerado um *[code smell](https://github.com/troessner/reek/blob/master/docs/Utility-Function.md)*, pois se o código não depende do objeto, não há porque seu uso depender de uma instância. Códigos como:

```ruby
class Calculator
  def sum(a, b)
    a + b
  end
  
  def mult(a, b)
    a * b
  end
end

calc = Calculator.new

calc.sum(1, 3)
# => 4
```

São candidatos fortes para a refatoração, porém, como podemos fazer isso com os recursos que acabamos de aprender?

Como não precisamos de instâncias, podemos utilizar um módulo e métodos de classe:

```ruby
module Calculator
  class << self
    def sum(a, b)
      a + b
    end
    
    def mult(a, b)
      a * b
    end
  end
end

Calculator.sum(1, 2)
# => 3
 
# Outra opção:

module Calculator
  Sum = ->x,y {x + y}
  Mult = ->x,y { x * y }
end

Calculator::Sum[1, 3]
# => 4

# ou
Calculator::Mult.call(1, 3)
# => 3

# ou
Calculator::Mult.(4, 5)
# => 20
```

Desse jeito, outros contextos podem reutilizar nossas definições, muito melhor 😊

### Classes como *namespaces*

Em quais situações é válido usar classes como *namespaces*? Aproveitando código da postagem passada, podemos ver um exemplo da própria biblioteca padrão do Ruby: a classe `Net::HTTP`

```ruby
require 'net/http'

HTTP_METHODS = {
  get: Net::HTTP::Get,
  post: Net::HTTP::Post
}.freeze

def request(method:, url:)
  uri = URI(url)
  http_method = HTTP_METHODS.fetch(method)
  request = http_method.new(uri)
  
  connection = Net::HTTP.new(uri.host, uri.port)
  connection.use_ssl = true if uri.scheme == 'https'
  
  connection.request(request).read_body
end
```

Nesse código é possível observar que para realizar a requisição, nós tivemos que instanciar dois objetos, `Net::HTTP::Get` ou `Net::HTTP::Post` (dependendo da variável `http_method`) e `Net::HTTP`.

Em objetos da classe `Net::HTTP::(Get|Post)` são guardadas informações da requisição, como corpo, *headers* e o caminho da requisição. Já objetos da classe `Net::HTTP` estão relacionados com a própria conexão TCP e podem ser usados para controlar quando a conexão é fechada (útil para fazer várias requisições de uma vez).

### *Mixins*

Nesse exemplo, vamos criar pontos no espaço cartesiano e uma coleção de pontos, que irão ser comparados pelo seu módulo. Para isso utilizaremos os dois *mixins* oferecidos pelo Ruby

```ruby
Distance = ->x,y { Math.sqrt(x**2 + y**2) }

class Points
  include Enumerable

  class Point
    include Comparable
    
    attr_reader :x, :y
    
    def initialize(x, y)
      @x = x
      @y = y
    end
    
    def <=>(other)
      Distance[x, y] <=> Distance[other.x, other.y]
    end
  end
  
  attr_reader :collection
  
  def initialize(collection)
    @collection = collection
  end
  
  def each
    @collection.each do |point|
      yield point.x, point.y
    end
  end
end

```

N