using Microsoft.AspNetCore.Mvc;

namespace BGClima.API.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
} 