using Microsoft.AspNetCore.Mvc;

namespace BGClima.API.Controllers
{
    public class AdminController : Controller
    {
        public IActionResult Product()
        {
            return View();
        }

        public IActionResult Index()
        {
            return View();
        }
    }
} 