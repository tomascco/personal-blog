---
template: post
title: "Módulos, Classes e Constantes: Interfaces no Ruby"
slug: modulos-classes-e-constantes
draft: false
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

## [Módulos](https://ruby-doc.org/core-2.7.2/Module.html)