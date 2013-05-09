class PageController < ApplicationController

  def index
    cookies[:history] = ActiveSupport::JSON.encode({"test" => 0}) if not cookies[:history]
    history = ActiveSupport::JSON.decode(cookies[:history])
    if params[:destination]
      history[params[:destination]] += 1 if history[params[:destination]]
      history.merge!({params[:destination] => 1}) if not history[params[:destination]]
    end
    if params[:buffer]
      cookies[:buffer] = params[:buffer]
    end
    cookies[:history] = ActiveSupport::JSON.encode(history)
    @destinations = history.sort_by{|k,v| v}.reverse.map{|k,v| k}
    @buffer = cookies[:buffer]
  end

end
