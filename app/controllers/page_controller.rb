class PageController < ApplicationController

  def index
    cookies[:history] = ActiveSupport::JSON.encode({"test" => 0}) if not cookies[:history]
    history = ActiveSupport::JSON.decode(cookies[:history])
    if params[:destination]
      puts params[:destination]
      history[params[:destination]] += 1 if history[params[:destination]]
      history.merge!({params[:destination] => 1}) if not history[params[:destination]]
    end
    cookies[:history] = ActiveSupport::JSON.encode(history)
    @destination = history.max_by{|k,v| v}[0]
  end

end
