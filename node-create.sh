apt update -y &&  apt install curl -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
\. "$HOME/.nvm/nvm.sh" && nvm install 20
export NVM_DIR="$HOME/.nvm" 
[ -s "$NVM_DIR/nvm.sh" ]
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

source ~/.bashrc