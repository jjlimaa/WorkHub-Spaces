---

**Autenticação e Utilizadores**

- Registo com validação dos campos obrigatórios (nome, email, contacto, morada, NIF) e opcionais (atividade, empresa)
- Login com JWT — token gerado e devolvido ao cliente
- Password encriptada com bcrypt antes de guardar
- Expiração do token (ex: 7 dias)
- Recuperação de password: o user pede por email → recebe link com token temporário → usa o link para definir nova password
- Sistema de roles: `client` e `admin` — rotas protegidas por role

---

**Espaços**

- CRUD completo (criar, listar, ver detalhes, editar, eliminar) — só admin cria/edita/elimina
- Cada espaço tem: nome, tipo (secretária/sala/gabinete/auditório), descrição, capacidade, equipamentos, preço por hora e por dia, imagens (upload via Multer), estado ativo/inativo
- Listagem pública com pesquisa por nome, capacidade e intervalo de datas
- Ordenação por preço, popularidade, capacidade, data
- Paginação em todas as listagens

---

**Reservas**

- Cliente cria reserva: escolhe espaço, data, hora, duração, observações
- Estados: `pendente` → `confirmada` → `concluída` / `cancelada`
- Admin pode confirmar, cancelar, alterar horário, adicionar observações internas
- Cliente vê histórico (passadas e futuras), com custo total e estado
- Validação de conflitos: não pode reservar um espaço já ocupado naquele período

---

**Serviços Extra**

- CRUD completo gerido pelo admin: nome, descrição, preço, disponibilidade
- Cliente pode adicionar serviços a uma reserva (impressões, coffee break, audiovisual, cacifo)
- Custo dos serviços somado ao custo total da reserva

---

**Gestão de Clientes (área admin)**

- Listar todos os utilizadores registados
- Ver histórico de reservas de cada utilizador
- Suspender/reativar conta de um utilizador

---

**Notificações**

- Envio de email automático quando uma reserva é confirmada ou cancelada (Nodemailer)
- Envio de email no pedido de recuperação de password

---

**Requisitos técnicos transversais**

- Pesquisa: `?nome=`, `?capacidade=`, `?dataInicio=&dataFim=`
- Ordenação: `?sort=preco`, `?sort=capacidade`, etc.
- Paginação: `?page=1&limit=10` em todas as listagens
- Rotas separadas por tipo: públicas, cliente (JWT), admin (JWT + role)
- Upload de imagens para espaços via Multer
- Tratamento de erros global (middleware de erros no fim do `server.js`)
- Variáveis sensíveis em `.env` (string MongoDB, segredo JWT, credenciais email)

---

