require 'bundler'
Bundler.require

require 'sinatra/asset_pipeline/task'
require './app'

Sinatra::AssetPipeline::Task.define! App

namespace :maintain do
  desc 'Clear all uploaded file older than 30 minutes'
  task :clean_uploads do
    files_to_delete = Dir['temp/**/*'].delete_if do |f|
      File.open(f).ctime >= Time.now - 30 * 60
    end
    File.delete(*files_to_delete)
  end
end
