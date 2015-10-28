require 'sinatra'

set :bind, '0.0.0.0'
set :port, 5002
set :public_folder, Proc.new { File.join(root, "build") }
set :static, true

not_found do
  status 200
  File.read(File.join('build', 'index.html'))
end
