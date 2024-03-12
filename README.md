                                             

The P4D-GUI is a tool that allows the creation of P4 testbeds using Docker hosts with a BMV2 P4 switch executed in Docker.
Documentation and How To are available at
https://dnredsons-organization.gitbook.io/p4d-gui/

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
  
  Start the server with sudo permissions, since Docker commands require sudo:
  
     sudo node app.js

  Open the GUI at localhost:3000 with your browser

You can also Download the .ova image with the complete environment already configured
The default user and password for the image is "p4d"
https://drive.google.com/file/d/1BU-LGeaMMpN9443RQxp0BIy23iCflg3Y/view?usp=sharing

