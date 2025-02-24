import UIKit
import WebKit
import Combine
import Swifter
import UniformTypeIdentifiers

// Contrôleur de vue pour afficher une WebView avec un serveur HTTP local
public class WebViewController: UIViewController {
    
    internal let webView: WKWebView  // La WebView pour afficher le contenu web
    var server: HttpServer!  // Le serveur HTTP local pour servir des fichiers
    
    // Callbacks pour gérer la fermeture de la vue et les états de la WebView
    public var didClose: (() -> Void)?
    
    // Propriétés publiées pour observer les changements de l'URL, de l'état de chargement, etc.
    @Published public private(set) var url: URL? = nil
    @Published public private(set) var isLoading: Bool = false
    @Published public private(set) var estimatedProgress: Double = 0.0
    @Published public private(set) var canGoBack: Bool = false
    @Published public private(set) var canGoForward: Bool = false
    
    private var queue: [UIViewController] = []  // File d'attente pour la gestion des présentations de vues
    private var fileToLoad: URL?  // Fichier à charger dans la WebView
    private var serverObserver: AnyCancellable?  // Observateur pour redémarrer le serveur HTTP en cas d'arrêt
    
    // Initialisation du contrôleur avec configuration de la WebView
    public init() {
        let configuration = WKWebViewConfiguration()
        configuration.allowsAirPlayForMediaPlayback = false
        configuration.allowsInlineMediaPlayback = true
        configuration.allowsPictureInPictureMediaPlayback = false
        configuration.mediaTypesRequiringUserActionForPlayback = []
        configuration.dataDetectorTypes = []
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = true
        configuration.preferences.javaScriptEnabled = true
        
        self.webView = WKWebView(frame: .zero, configuration: configuration)
        
        super.init(nibName: nil, bundle: nil)
        
        // Démarrer le serveur HTTP local
        startWebServer()
        
        // Observateur pour redémarrer le serveur en cas d'arrêt
        serverObserver = NotificationCenter.default.publisher(for: Notification.Name("ServerDidStop"))
            .sink { [weak self] _ in
                self?.restartWebServer()
            }
    }

    // Fonction pour démarrer le serveur HTTP local
    func startWebServer() {
        server = HttpServer()
        
        // Ajout de différents endpoints pour servir des fichiers
        let tempDir = FileManager.default.temporaryDirectory.path
        server["/temp/:path"] = { request in
            // Gérer les requêtes pour les fichiers temporaires
            let start = request.path.index(request.path.startIndex, offsetBy: 1)
            let filePath = tempDir + "/\(request.path[start..<request.path.endIndex])"
            if let file = try? Data(contentsOf: URL(fileURLWithPath: filePath)) {
                let mimeType = filePath.mimeType()
                return .raw(200, "OK", [
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                    "Content-Type": mimeType
                ], { writer in
                    try writer.write(file)
                })
            } else {
                return HttpResponse.notFound
            }
        }
        
        server["/:path"] = {request in
             let start = request.path.index(request.path.startIndex, offsetBy: 1)
             let end = request.path.endIndex
             let filePath = Bundle.main.resourcePath! + "/ressources/\(request.path[start..<end])"
             if let file = try? Data(contentsOf: URL(fileURLWithPath: filePath)) {
                 let mimeType = filePath.mimeType()
                 return .raw(200, "OK", [
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                            "Access-Control-Allow-Headers": "Content-Type, Authorization",
                            "Content-Type": mimeType
                        ], { writer in
                            try writer.write(file)
                        })
             } else {
                 return HttpResponse.notFound
             }
         }
         
        // Ajout d'autres endpoints pour servir des modèles spécifiques
        addModelEndpoints(to: server)
        
        do {
            try server.start(8080)
            print("Server started at http://localhost:8080")
        } catch {
            print("Error starting server: \(error)")
            notifyServerDidStop()
        }
    }
    
    // Fonction pour ajouter des endpoints de modèles au serveur
    private func addModelEndpoints(to server: HttpServer) {
        let resourcesPath = Bundle.main.resourcePath! + "/ressources/"
        
        let modelEndpoints = [
            "/models/posenet/mobilenet/quant2/075/",
            "/models/mobilenet_v1_0.25_224/",
            "/models/mobilenet_v1_025_224/",
            "/models/facemesh/",
            "/models/handdetector/",
            "/models/handskeleton/",
            "/models/blazeface/"
        ]
        
        for endpoint in modelEndpoints {
            server[endpoint + ":path"] = { request in
                let start = request.path.index(request.path.startIndex, offsetBy: 1)
                let filePath = resourcesPath + "\(request.path[start..<request.path.endIndex])"
                if let file = try? Data(contentsOf: URL(fileURLWithPath: filePath)) {
                    let mimeType = filePath.mimeType()
                    return .raw(200, "OK", [
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization",
                        "Content-Type": mimeType
                    ], { writer in
                        try writer.write(file)
                    })
                } else {
                    return HttpResponse.notFound
                }
            }
        }
    }
    
    // Fonction pour redémarrer le serveur
    func restartWebServer() {
        print("Restarting server...")
        server.stop()
        startWebServer()
    }
    
    // Fonction pour notifier que le serveur est arrêté
    func notifyServerDidStop() {
        NotificationCenter.default.post(name: Notification.Name("ServerDidStop"), object: nil)
    }
    
    // Initialisation avec un WebView externe (non utilisé ici)
    public init(webView: WKWebView) {
        self.webView = webView
        super.init(nibName: nil, bundle: nil)
    }
    
    // Initialisation requise pour les vues créées par code
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    // Chargement de la vue avec la WebView
    public override func loadView() {
        self.view = webView
    }
    
    // Configuration supplémentaire après le chargement de la vue
    public override func viewDidLoad() {
        super.viewDidLoad()
        
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 77/255, green: 151/255, blue: 255/255, alpha: 1)
        webView.publisher(for: \.url).assign(to: &$url)
        webView.publisher(for: \.isLoading).assign(to: &$isLoading)
        webView.publisher(for: \.estimatedProgress).assign(to: &$estimatedProgress)
        webView.uiDelegate = self
        webView.configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        webView.configuration.setValue(true, forKey: "allowUniversalAccessFromFileURLs")
        if #available(iOS 16.4, *) {
                   webView.isInspectable = true
                }
    }
    
    // Chargement d'un fichier Scratch (SB) dans la WebView
    public func loadSBFile(_ url: URL, start: Bool) {
        var didStartAccessing = false
        if url.startAccessingSecurityScopedResource() {
            didStartAccessing = true
        }
        
        defer {
            if didStartAccessing {
                url.stopAccessingSecurityScopedResource()
            }
        }
        
        // Copie du fichier dans un emplacement temporaire pour y accéder via le serveur local
        do {
            let fileManager = FileManager.default
            let tempDir = fileManager.temporaryDirectory
            let fileExtension = (url.lastPathComponent as NSString).pathExtension
            let tempFileURL = tempDir.appendingPathComponent("temp/temp." + fileExtension)
            
            if fileManager.fileExists(atPath: tempFileURL.path) {
                try fileManager.removeItem(at: tempFileURL)
            }
            try fileManager.copyItem(at: url, to: tempFileURL)
            
            // Injecter le JavaScript pour charger le projet Scratch dans la WebView
            let jsCode = """
            (function() {
                function loadProject() {
                    window.loadProjectFromUrl('http://localhost:8080/temp/temp.\(fileExtension)','\(url.deletingPathExtension().lastPathComponent)',\(start));
                }
                if (document.readyState === 'complete') {
                    loadProject();
                } else {
                    window.addEventListener('load', loadProject);
                }
            })();
            """
            webView.evaluateJavaScript(jsCode, completionHandler: { (result, error) in
                if let error = error {
                    print("Error loading SB file: \(error)")
                }
            })
        } catch {
            print("Failed to copy SB file: \(error)")
        }
    }
    
    // Fonction pour charger un fichier après un délai (si nécessaire)
    public func loadFileAfterDelay() {
        guard let fileToLoad = self.fileToLoad else { return }
        self.loadSBFile(fileToLoad, start: true)
        self.fileToLoad = nil
    }
    
    // Présenter une vue ou l'ajouter à la file d'attente si une vue est déjà présentée
    private func presentOrQueue(_ viewController: UIViewController) {
        if presentedViewController != nil {
            queue.append(viewController)
        } else {
            present(viewController, animated: true)
        }
    }
    
    // Présenter la prochaine vue dans la file d'attente
    private func presentQueueingViewController() {
        if !queue.isEmpty {
            let vc = queue.removeFirst()
            present(vc, animated: true)
        }
    }
}

extension WebViewController {
    
    public func load(url: URL) {
        let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "build")!
        webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        NotificationCenter.default.addObserver(forName: Notification.Name("LoadSBFile"), object: nil, queue: .main) { notification in
                    if let url = notification.object as? URL {
                        self.fileToLoad = url
                                       if !self.webView.isLoading {
                                           self.loadSBFile(url,start:false) // Charger immédiatement si la webview n'est pas en cours de chargement
                                       }
                    }
                }
    }
    
    
}

// Extension pour la gestion des types MIME en fonction des extensions de fichiers
extension String {
    func mimeType() -> String {
        let url = URL(fileURLWithPath: self)
        let pathExtension = url.pathExtension
        if let uti = UTType(filenameExtension: pathExtension),
           let mimeType = uti.preferredMIMEType {
            return mimeType
        }
        return "application/octet-stream"
    }
}

// Implémentation du délégué de la WebView pour les interactions utilisateur
extension WebViewController: WKUIDelegate {
    // Implémentation pour créer une nouvelle WebView
    public func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        guard navigationAction.targetFrame?.isMainFrame != true else { return nil }
        
        let newWebView = WKWebView(frame: webView.bounds, configuration: configuration)
        let vc = WebViewController(webView: newWebView)
        vc.presentationController?.delegate = self
        vc.didClose = { [weak self] in
            self?.presentQueueingViewController()
        }
        
        presentOrQueue(vc)
        
        return newWebView
    }
    
    // Fonction pour fermer une WebView
    public func webViewDidClose(_ webView: WKWebView) {
        dismiss(animated: true) { [weak self] in
            self?.didClose?()
        }
    }
    
    // Gérer les alertes JavaScript
    public func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alertController = UIAlertController(title: "", message: message, preferredStyle: .alert)
        let okAction = UIAlertAction(title: NSLocalizedString("OK", bundle: Bundle.module, comment: "OK"), style: .default) { [weak self] _ in
            completionHandler()
            self?.presentQueueingViewController()
        }
        alertController.addAction(okAction)
        
        presentOrQueue(alertController)
    }
    
    // Gérer les fenêtres de confirmation JavaScript
    public func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alertController = UIAlertController(title: "", message: message, preferredStyle: .alert)
        let cancelAction = UIAlertAction(title: NSLocalizedString("Cancel", bundle: Bundle.module, comment: "Cancel"), style: .cancel) { [weak self] _ in
            completionHandler(false)
            self?.presentQueueingViewController()
        }
        let okAction = UIAlertAction(title: NSLocalizedString("OK", bundle: Bundle.module, comment: "OK"), style: .default) { [weak self] _ in
            completionHandler(true)
            self?.presentQueueingViewController()
        }
        alertController.addAction(cancelAction)
        alertController.addAction(okAction)
        
        presentOrQueue(alertController)
    }
    
    // Gérer les fenêtres de saisie de texte JavaScript
    public func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (String?) -> Void) {
        let alertController = UIAlertController(title: "", message: prompt, preferredStyle: .alert)
        alertController.addTextField() { textField in
            textField.text = defaultText
        }
        let cancelAction = UIAlertAction(title: NSLocalizedString("Cancel", bundle: Bundle.module, comment: "Cancel"), style: .cancel) { [weak self] _ in
            completionHandler(nil)
            self?.presentQueueingViewController()
        }
        let okAction = UIAlertAction(title: NSLocalizedString("OK", bundle: Bundle.module, comment: "OK"), style: .default) { [weak self, weak alertController] _ in
            completionHandler(alertController?.textFields?.first?.text)
            self?.presentQueueingViewController()
        }
        alertController.addAction(cancelAction)
        alertController.addAction(okAction)
        
        presentOrQueue(alertController)
    }
}

// Implémentation du délégué de présentation pour gérer la fermeture des vues modales
extension WebViewController: UIAdaptivePresentationControllerDelegate {
    public func presentationControllerDidDismiss(_ presentationController: UIPresentationController) {
        presentQueueingViewController()
    }
}
