require 'bundler'
Bundler.require

require 'sinatra/asset_pipeline'
require 'digest/md5'

class App < Sinatra::Base
  set :assets_precompile, %w(application.js application.css)
  set :assets_js_compressor, :uglifier
  set :assets_css_compressor, :sass
  register Sinatra::AssetPipeline

  get '/' do
    erb :index
  end

  post '/upload' do
    content_type :json

    song = params[:song]
    return 400 if song.nil?
    return 400 unless song[:type].start_with? 'audio/'
    filename = Digest::MD5.hexdigest "#{request.ip}|#{Time.now.to_i}"
    originName = File.basename song[:filename], '.*'
    temp_file_path = "./temp/#{filename}"

    File.open(temp_file_path, 'wb') do |f|
      f.write(song[:tempfile].read)
    end

    song = FFMPEG::Movie.new temp_file_path
    return 400 unless song.valid?

    {
      filename: filename,
      originName: originName,
      duration: song.duration
    }.to_json
  end

  post '/render' do
    filename, originName = params[:filename], params[:originName]
    temp_file_path = "./temp/#{filename}"
    ringtone_path = "#{temp_file_path}.m4a"
    ss, to = params[:range].split(',').map(&:to_i)

    song = FFMPEG::Movie.new temp_file_path
    return 400 unless song.valid?

    song.transcode ringtone_path, "-c:a libfdk_aac -ss #{ss} -to #{to} -vn -sn -y"

    send_file ringtone_path, filename: "#{originName}.m4r", type: 'audio/MP4A-LATM'
  end
end
