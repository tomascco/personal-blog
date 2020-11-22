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

Assim como módulos, podem ser *namespace*:

```ruby
class Mammals
  class Dog
  end
end

Mammals::Dog.new
# => <A::B::C>
```