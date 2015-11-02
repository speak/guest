FROM ruby:2.1.5
RUN gem install foreman
RUN gem install sinatra
RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get install -y nodejs
RUN rm /usr/bin/node
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN npm install -g grunt-cli

ADD . /guest
WORKDIR /guest

CMD ["foreman", "start"] 
