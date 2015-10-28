FROM ruby:2.1.5
RUN gem install foreman
RUN gem install sinatra
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y nodejs
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN apt-get install -y npm
RUN npm install -g grunt-cli

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /guest && cp -a /tmp/node_modules /guest

ADD . /guest
WORKDIR /guest

CMD ["foreman", "start"] 
