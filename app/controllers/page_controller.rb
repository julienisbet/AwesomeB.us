class PageController < ApplicationController

  def index
    @history = cookies[:history]
    cookies[:history] = params[:destination] if params[:destination]
  end

end
