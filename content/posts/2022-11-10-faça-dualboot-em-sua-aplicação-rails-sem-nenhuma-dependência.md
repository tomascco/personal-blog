---
template: post
title: Faça dualboot em sua aplicação Rails sem nenhuma dependência
slug: faca-dualboot-sem-dependencias
draft: false
date: 2022-11-10T01:37:53.533Z
description: Aprenda como configurar o Dualboot (estratégia utilizada para rodar
  sua aplicação com dois Gemfiles diferentes) sem instalar nada!
category: Ruby
tags:
  - ruby
  - dualboot
  - dicas
---
## Mas o que é dualboot?

No contexto de Ruby, dualboot significa rodar sua aplicação com dois Gemfiles
diferentes, ou seja, com dois conjuntos de dependências diferentes. Já no contexto
de Rails, significa que um dos Gemfiles é exatamente o seu atual e o outro corresponde
à próxima versão do Rails, chamada normalmente de *next*. Nela, a única mudança
que fazemos é mudar a versão do Rails, logo se seu sistema roda o Rails 6.1 por exemplo,
poderíamos fazer o seguinte esquema:

|                     | Versão atual | Próxima versão (next) |
| ------------------- | ------------ | --------------------- |
| Nome do Gemfile     | Gemfile      | Gemfile.next          |
| Versão do Rails     | 6.1          | 7.0                   |
| Outras dependências | Igual        | Igual*                |

* \*Pode ser necessário algumas atualizações de outras gems para que haja compatibilidade com versões novas do Rails.

## Tá, mas qual a vantagem?

A maioria das mudanças necessárias para que seu sistema seja compatível com uma
nova versão do Rails **podem ser feitas na versão anterior**. Isso significa que é possível trabalhar em atualizações de versões do Rails **sem efetivamente mudar sua versão.**


Utilizar a técnica do dualboot permite que você tenha mais clareza das mudanças
que precisam ser feitas para se atualizar a versão do Rails, mas sem precisar atualizar.
Isso acontece porque seu sistema irá rodar em duas versões diferentes do Rails
(a que está em uso agora e a próxima versão), logo todos os processos de testes
(automatizados, manuais, end to end, etc) podem ser feitos nas duas versões. Dessa
maneira também é possível fazer com que todo o código novo que entre no sistema
já seja compatível com a versão nova.

## E como faz?

1. Na pasta do projeto, crie um *link simbólico* apontando para seu `Gemfile`:

```bash
ln -s Gemfile Gemfile.next
```

* Com o comando acima, criamos um "apelido", um novo nome para se referir ao
  conteúdo de um arquivo que já existe e conhecemos bem: `Gemfile` e esse apelido é
  `Gemfile.next`

2. No seu `Gemfile`, adicione o seguinte código no começo do arquivo:

```ruby
def next?
  File.basename(__FILE__) == "Gemfile.next"
end
```

* Com esse código, nosso `Gemfile` irá saber "por qual nome está sendo chamado".
  Sempre que utilizarmos o nome `Gemfile` (padrão) para fazer nosso *bundle*, o
  método `next?` retornará `false`. Agora se utilizarmos o nome `Gemfile.next` para se
  referir ao mesmo conteúdo, o método `next?` irá retornar `true`! Logo, com um
  "conteúdo", conseguimos dois comportamentos diferentes.

3. Defina condicionalmente quais quais serão as dependências de sua versão *next*.

```ruby
# Gemfile

# Podemos trocar
gem "rails", "~> 6.1.0"

# Por:
if next?
  gem "rails", "~> 7.0.0"
else
  gem "rails", "~> 6.1.0"
end
```

* Podemos replicar também o exemplo acima para outras gems!

4. Faça bundle de sua versão *next* pela primeira vez e faça commit do arquivo
   `Gemfile.next.lock` do mesmo jeito que é feito com o arquivo `Gemfile.lock`:

```bash
# Para rodar qualquer comando com a versão next, utilize a variável de ambiente
# BUNDLE_GEMFILE com o valor "Gemfile.next"
BUNDLE_GEMFILE="Gemfile.next" bundle install
```

* Todos os cuidados que tomamos com o arquivo `Gemfile.lock` também se aplicam para
  o `Gemfile.next.lock`. Por exemplo, após qualquer modicação no Gemfile, precisamos rodar:

```bash
bundle
BUNDLE_GEMFILE="Gemfile.next" bundle
```

para atualizar os **dois** arquivos *.lock*.

5. Seja feliz!

```bash
# como dito anteriormente, para rodar qualquer comando com a próxima versão
# utilizamos BUNDLE_GEMFILE="Gemfile.next":

BUNDLE_GEMFILE="Gemfile.next" rails db:migrate
BUNDLE_GEMFILE="Gemfile.next" rails server
BUNDLE_GEMFILE="Gemfile.next" rails test
# ...

BUNDLE_GEMFILE="Gemfile.next" bundle add faraday
BUNDLE_GEMFILE="Gemfile.next" bundle update 
# ...
```

## Quais são os próximos passos?

* Faça merge do `Gemfile.next`, `Gemfile.next.lock` e das mudanças do `Gemfile` para a main!
  Colocar essas mudanças numa branch e só mergear ela quando os testes estiverem passando
  nas duas versões é exatamente a mesma coisa de não ter dualboot! Lembre-se que o
  objetivo é facilitar o processo de upgrade gradual e impedir que o código novo 
  seja incompatível com a versão nova, aumentando ainda mais o trabalho de upgrade.
* Não tem problema se o testes não passarem na versão *next*, seu objetivo agora
  é fazer eles passarem sem necessariamente precisar alterar a versão atual do Rails!
* É recomendável colocar o CI para rodar as duas versões sempre.
* Faça todas as correções necessárias para o upgrade sempre que possível na main.
  Lembre-se, um upgrade gradual é muito melhor que um Pull Request de 200 arquivos e
  3000 linhas!