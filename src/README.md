# 🏪 Mercados Públicos do Recife

Site interativo para promover o turismo nos mercados públicos do Recife, destacando os mercados de São José, Boa Vista e Casa Amarela.

## 📋 Sobre o Projeto

Este site foi desenvolvido para incentivar turistas a visitarem os mercados públicos do Recife, oferecendo uma experiência completa de descoberta, planejamento e compartilhamento de experiências.

## ✨ Funcionalidades Principais

### 1. 🗺️ Guia Interativo de Mercados
- Visualização dos 3 principais mercados: São José, Boa Vista e Casa Amarela
- Mapas interativos com Leaflet e OpenStreetMap
- Informações detalhadas de cada mercado (horários, localização, história)
- Sistema para cadastrar novos mercados (usuários logados)

### 2. 👥 Perfis de Vendedores
- Cadastro de vendedores com suas histórias e especialidades
- Fotos e descrições dos produtos vendidos
- Selos de autenticidade (Feito à Mão, Produção Local, Receita de Família)
- Localização da banca dentro do mercado
- Cada vendedor pode editar apenas seu próprio perfil

### 3. 🗺️ Roteiros Temáticos
- Criação de roteiros personalizados
- Temas como: Gastronomia, Artesanato, História e Cultura
- Checklists interativos para marcar atividades concluídas
- Sistema de favoritos para salvar roteiros preferidos

### 4. ⭐ Sistema de Avaliações
- Avaliações de mercados e vendedores (apenas usuários logados)
- Galeria de fotos enviadas pelos visitantes
- Comentários e notas de 1 a 5 estrelas
- Filtro por mercado específico

### 5. 🔍 Busca Unificada
- Pesquisa integrada de mercados e vendedores
- Filtros por categoria de produtos
- Sistema de favoritos (coração) para salvar preferidos
- Visualização em abas separadas

### 6. 🌍 Suporte Multilíngue
- Português (pt-BR)
- Inglês (en)
- Espanhol (es)
- Tradução automática de todo o conteúdo da interface

### 7. 🔐 Sistema de Autenticação
- Login e cadastro de usuários com Supabase Auth
- Perfil de usuário com gerenciamento de conta
- Apenas usuários logados podem:
  - Criar avaliações
  - Cadastrar vendedores
  - Cadastrar novos mercados
  - Favoritar mercados e vendedores

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React** - Framework JavaScript
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização moderna
- **Leaflet** - Mapas interativos
- **OpenStreetMap** - Dados de mapas
- **Shadcn/ui** - Componentes de interface
- **Lucide React** - Ícones

### Backend
- **Supabase** - Backend as a Service
- **Supabase Auth** - Autenticação de usuários
- **Edge Functions** - API serverless com Hono e Deno
- **KV Store** - Persistência de dados (mercados, vendedores, favoritos)

## 📱 Responsividade

O site é totalmente responsivo e funciona perfeitamente em:
- 📱 Dispositivos móveis (smartphones)
- 📱 Tablets
- 💻 Desktops

## 🎨 Design

- Interface moderna e intuitiva
- Paleta de cores inspirada nos mercados (laranjas, âmbares)
- Animações suaves e transições elegantes
- Acessibilidade com ARIA labels

## 🚀 Como Funciona

### Para Visitantes (sem login)
1. Navegue pelos mercados e veja informações detalhadas
2. Visualize perfis de vendedores
3. Explore roteiros temáticos
4. Veja avaliações de outros usuários
5. Use a busca para encontrar mercados ou vendedores específicos

### Para Usuários Registrados
Tudo acima, mais:
1. **Cadastrar vendedores** - Crie seu perfil de vendedor
2. **Escrever avaliações** - Compartilhe sua experiência
3. **Criar mercados** - Adicione novos mercados ao sistema
4. **Favoritar** - Salve seus mercados e vendedores preferidos
5. **Editar perfil** - Gerencie suas informações

## 📊 Estrutura de Dados

### Mercados
- Nome, descrição, endereço
- Horários de funcionamento
- Coordenadas GPS para o mapa
- Galeria de fotos
- Status de verificação

### Vendedores
- Nome, especialidade, história
- Produtos vendidos
- Localização da banca
- Foto do perfil
- Selos de autenticidade
- Contatos (telefone, WhatsApp, Instagram)
- Mercado vinculado

### Avaliações
- Nota (1-5 estrelas)
- Comentário
- Fotos (até 5 por avaliação)
- Data de criação
- Autor

### Favoritos
- Mercados favoritos do usuário
- Vendedores favoritos do usuário
- Sincronização em tempo real

## 🎯 Objetivos do Projeto

1. **Promover o turismo local** - Atrair mais visitantes para os mercados públicos
2. **Valorizar vendedores** - Dar visibilidade aos comerciantes locais
3. **Preservar a cultura** - Documentar histórias e tradições dos mercados
4. **Facilitar o planejamento** - Ajudar turistas a organizarem suas visitas
5. **Conectar pessoas** - Criar uma comunidade em torno dos mercados

## 🌟 Diferenciais

- ✅ Interface em 3 idiomas
- ✅ Mapas interativos com localização real
- ✅ Histórias autênticas dos vendedores
- ✅ Sistema de avaliações com fotos
- ✅ Roteiros personalizáveis
- ✅ Selos de autenticidade para produtos
- ✅ 100% responsivo
- ✅ Persistência real com Supabase

## 📄 Licença

Este projeto foi desenvolvido para promover os mercados públicos do Recife.
