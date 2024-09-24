const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const Docker = require('dockerode');
const expressWs = require('express-ws');
const pty = require('node-pty'); // Certifique-se de que o node-pty está corretamente importado

const app = express();
const docker = new Docker();
expressWs(app);

app.use(express.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

const port = 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.post('/deploy-project', (req, res) => {
  const projectName = req.body.projectName;
  const scriptPath = path.join(__dirname, '/public/projects', projectName, 'deploy.sh');

  if (!fs.existsSync(scriptPath)) {
    return res.status(400).send(`Script deploy.sh não encontrado para o projeto ${projectName}`);
  }

  // Executa o script deploy.sh em background
  exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`Erro ao executar o deploy: ${stderr}`);
    }

    res.status(200).send('Ambiente configurado com sucesso');
  });
});

app.post('/clean-project', (req, res) => {
  const projectName = req.body.projectName;
  const scriptPath = path.join(__dirname, '/public/projects', projectName, 'delete.sh');

  if (!fs.existsSync(scriptPath)) {
    return res.status(400).send(`Script delete.sh não encontrado para o projeto ${projectName}`);
  }

  // Executa o script delete.sh em background
  exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`Erro ao limpar o ambiente: ${stderr}`);
    }

    res.status(200).send('Ambiente limpo com sucesso');
  });
});

app.get('/list-projects', (req, res) => {
  const projectsDir = path.join(__dirname, '/public/projects');
  
  fs.readdir(projectsDir, (err, files) => {
    if (err) {
      return res.status(500).send('Erro ao listar projetos');
    }

    // Filtra apenas diretórios
    const directories = files.filter(file => {
      return fs.statSync(path.join(projectsDir, file)).isDirectory();
    });

    res.json(directories);
  });
});
app.post('/save-project', (req, res) => {
  const { projectName, deployCode, deleteCode, topologyJson } = req.body;

  const projectDir = path.join(__dirname, '/public/projects', projectName);

  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  fs.writeFileSync(path.join(projectDir, 'deploy.sh'), deployCode);
  fs.writeFileSync(path.join(projectDir, 'delete.sh'), deleteCode);
  fs.writeFileSync(path.join(projectDir, 'topology.json'), topologyJson);

  res.status(200).send('Arquivos salvos com sucesso');
});
app.ws('/log-switch', (ws, req) => {
  const containerName = req.query.name;

  docker.getContainer(containerName).inspect((err, data) => {
    if (err) {
      ws.send("Erro: Container não encontrado ou não está rodando.");
      ws.close();
    } else {
      // Executa o comando tail -f no arquivo de log dentro do container
      const terminal = pty.spawn('docker', ['exec', '-it', containerName, 'tail', '-f', '/tmp/switch.log'], {
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd: process.env.HOME,
        env: process.env
      });

      // Enviar dados do terminal para o WebSocket
      terminal.on('data', function(data) {
        ws.send(data);
      });

      // Quando o WebSocket recebe dados do cliente
      ws.on('message', function(msg) {
        terminal.write(msg);
      });

      // Quando o WebSocket fecha
      ws.on('close', function() {
        terminal.kill();
      });
    }
  });
});
app.ws('/terminal', (ws, req) => {
  const containerName = req.query.name;

  docker.getContainer(containerName).inspect((err, data) => {
    if (err) {
      ws.send("Erro: Container não encontrado ou não está rodando.");
      ws.close();
    } else {
      // Cria um terminal interativo no container Docker usando node-pty
      const terminal = pty.spawn('docker', ['exec', '-it', containerName, 'sh'], {
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd: process.env.HOME,
        env: process.env
      });

      // Enviar dados do terminal para o WebSocket
      terminal.on('data', function(data) {
        ws.send(data);
      });

      // Quando o WebSocket recebe dados do cliente
      ws.on('message', function(msg) {
        terminal.write(msg);
      });

      // Quando o WebSocket fecha
      ws.on('close', function() {
        terminal.kill();
      });
    }
  });
});

app.get('/projectsdeploy', (req, res) => {
  res.sendFile(__dirname + '/public/projects.html');
});

app.get('/compiler', (req, res) => {
  res.sendFile(__dirname + '/public/compiler.html');
});

app.post('/start-container', (req, res) => {
  const containerName = req.query.name;

  if (!containerName) {
    return res.status(400).send('O nome do container é obrigatório.');
  }

  const container = docker.getContainer(containerName);

  container.start((err, data) => {
    if (err) {
      return res.status(500).send('Erro ao iniciar o container: ' + err.message);
    }
    res.status(200).send('Container iniciado com sucesso');
  });
});

app.post('/compiler', (req, res) => {
  const title = req.body.title;
  const code = req.body.code;

  fs.writeFileSync(`/var/lib/docker/volumes/shared/_data/${title}.p4`, code);

  exec(`docker exec compiler p4c-bm2-ss ${title}.p4 -o ${title}.json`, (error, stdout, stderr) => {
    if (error || stderr) {
      res.json({
        success: false,
        error: error?.message || stderr,
        title: title,
        code: code
      });
    } else {
      res.json({
        success: true,
        output: stdout,
        title: title,
        code: code
      });
    }
  });
});

app.get('/download', (req, res) => {
  const title = req.query.title;
  
  if (!title) {
    return res.status(400).send("File not specified.");
  }

  const filePath = `/var/lib/docker/volumes/shared/_data/${title}.json`;
  res.download(filePath, `${title}.json`, (err) => {
    if (err) {
      res.status(500).send("Error trying to download the file");
    }
  });
});

app.get('/check-container-status', (req, res) => {
  const containerName = req.query.name;

  if (!containerName) {
    return res.status(400).send('O nome do container é obrigatório.');
  }

  docker.listContainers({ all: true }, (err, containers) => {
    if (err) {
      return res.status(500).send('Erro ao listar os containers: ' + err.message);
    }

    const container = containers.find(c => c.Names.includes(`/${containerName}`));

    if (container) {
      res.json({ isRunning: container.State === 'running' });
    } else {
      res.json({ isRunning: false });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
