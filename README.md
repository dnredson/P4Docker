                                             

The P4D-GUI is a tool that allows the creation of P4 testbeds using Docker hosts with a BMV2 P4 switch executed in Docker.


Requisites:
  - Ubuntu/Debian 18 or superior
  
  - Nodejs 18 or newer

  - NPM
  
  - Git
  
  - Docker
  
  - Curl
  

Installation: 

  Copy the "install.sh" file
  
  Give permisson for execution to the script
  
     chmod +x install.sh
  
  Execute the install.sh file, the file will automatically install the requisites and clone this repository
  
    ./install.sh

Execution:

  Access the P4D-GUI folder
  
  Start the server:
  
     node app.js

  Open the GUI at localhost:3000 with your browser
