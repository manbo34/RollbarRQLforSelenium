## Environment 
1. Start selenium server
```bash
docker clone https://github.com/SeleniumHQ/selenium.git
./bin/run-selenium-server.sh
```

2. Set Environment

```bash
cp .env.example .env
vi .env
## edit .env file
ROLLBAR_NAME=rollbar user name
ROLLBAR_PASSWORD=rollbar user password
PROJECT_IDS=project ids(example: 111,222,333)
SLACK_WEB_HOOK=[Specify SlackWebHookURL to detect Slack]
```

## Usage

```bash
node ./src/rollbar.js
```